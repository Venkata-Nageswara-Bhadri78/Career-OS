import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../../../common/api/apiConfig";
import { AUTH_MESSAGES } from "../../../common/api/apiError";
import { endSession, getAuthorizationHeader } from "../../../common/api/sessionBridge";
import {
  COMMUNITY_HEARTBEAT_MS,
  COMMUNITY_RECONNECT,
  COMMUNITY_SOCKET_DEST,
  COMMUNITY_SOCKET_STATES,
  COMMUNITY_WS_PATH,
} from "../config/communityConstants";
import { mapCommunityMessage } from "../mappers/communityMappers";

const EXTENSION_TEXT = "This client is not authorized to access this resource.";

let client = null;
let state = COMMUNITY_SOCKET_STATES.IDLE;
let stateReason = "";
let connectionEpoch = 0;
let manualClose = false;
let stopped = false;
let reconnectTimer = null;
let reconnectDelay = COMMUNITY_RECONNECT.INITIAL_DELAY_MS;
let userQueuesBound = false;
const roomSubscriptions = new Map();
const listeners = new Set();

export function communityBrokerUrl() {
  const pageHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const base = new URL(API_BASE_URL, origin);
  const protocol = pageHttps || base.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${base.host}${COMMUNITY_WS_PATH}`;
}

export function getCommunitySocketState() {
  return { state, reason: stateReason, connectionEpoch };
}

export function subscribeCommunitySocket(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(event) {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      /* a listener fault must not stop the socket */
    }
  });
}

function setState(next, reason = "") {
  state = next;
  stateReason = reason;
  emit({ type: "state", state, reason, connectionEpoch });
}

function parseJson(body) {
  if (body == null || body === "") return null;
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function frameMessage(frame) {
  const header = typeof frame?.headers?.message === "string" ? frame.headers.message.trim() : "";
  if (header) return header;
  const body = parseJson(frame?.body);
  if (typeof body?.message === "string" && body.message.trim()) return body.message.trim();
  return typeof frame?.body === "string" ? frame.body.trim() : "";
}

function classifyConnectFailure(message) {
  const text = String(message || "").trim();
  if (text.toLowerCase() === EXTENSION_TEXT.toLowerCase() || text === EXTENSION_TEXT) return "extension";
  if (text.toLowerCase() === AUTH_MESSAGES.COMPLETE_USERNAME.toLowerCase()) return "username";
  if (text === AUTH_MESSAGES.UNAUTHORIZED || text.toLowerCase() === AUTH_MESSAGES.UNAUTHORIZED.toLowerCase()) {
    return "unauthorized";
  }
  return "retry";
}

function clearReconnect() {
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (manualClose || stopped) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    setState(COMMUNITY_SOCKET_STATES.RECONNECTING, "Waiting for a network connection.");
    return;
  }
  setState(COMMUNITY_SOCKET_STATES.RECONNECTING, "Reconnecting…");
  clearReconnect();
  const delay = reconnectDelay;
  reconnectDelay = Math.min(reconnectDelay * COMMUNITY_RECONNECT.MULTIPLIER, COMMUNITY_RECONNECT.MAX_DELAY_MS);
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    if (manualClose || stopped) return;
    startClient();
  }, delay);
}

function bindUserQueues() {
  if (!client?.connected || userQueuesBound) return;
  client.subscribe(COMMUNITY_SOCKET_DEST.USER_ERRORS, (frame) => {
    const body = parseJson(frame.body);
    emit({
      type: "error",
      code: typeof body?.code === "string" ? body.code : "",
      message: typeof body?.message === "string" ? body.message : "",
    });
  }, { id: "community-user-errors" });
  client.subscribe(COMMUNITY_SOCKET_DEST.USER_MEMBERSHIP, (frame) => {
    const body = parseJson(frame.body);
    if (!body) return;
    emit({
      type: "membership",
      communityId: body.communityId ?? null,
      userId: body.userId ?? null,
      membership: typeof body.membership === "string" ? body.membership : "",
    });
  }, { id: "community-user-membership" });
  client.subscribe(COMMUNITY_SOCKET_DEST.USER_PRESENCE, (frame) => {
    const body = parseJson(frame.body);
    if (!body) return;
    const online = Array.isArray(body.online) ? body.online : [];
    emit({
      type: "snapshot",
      communityId: body.communityId ?? null,
      online,
    });
  }, { id: "community-user-presence" });
  userQueuesBound = true;
}

function dropRoomSubscriptions() {
  roomSubscriptions.forEach((entry) => {
    try {
      entry.messages?.unsubscribe();
    } catch {
      /* already gone */
    }
    try {
      entry.presence?.unsubscribe();
    } catch {
      /* already gone */
    }
  });
  roomSubscriptions.clear();
}

export function subscribeCommunityRoom(communityId) {
  if (!client?.connected || communityId == null || communityId === "") return;
  const key = String(communityId);
  if (roomSubscriptions.has(key)) return;
  const messages = client.subscribe(COMMUNITY_SOCKET_DEST.messages(key), (frame) => {
    const mapped = mapCommunityMessage(parseJson(frame.body));
    if (!mapped?.id) return;
    emit({ type: "message", communityId: mapped.communityId ?? key, message: mapped });
  }, { id: `community-${key}-messages` });
  const presence = client.subscribe(COMMUNITY_SOCKET_DEST.presence(key), (frame) => {
    const body = parseJson(frame.body);
    if (!body) return;
    emit({
      type: "presence",
      communityId: body.communityId ?? key,
      userId: body.userId ?? null,
      status: typeof body.status === "string" ? body.status : "",
    });
  }, { id: `community-${key}-presence` });
  roomSubscriptions.set(key, { messages, presence });
}

export function unsubscribeCommunityRoom(communityId) {
  const key = String(communityId ?? "");
  const entry = roomSubscriptions.get(key);
  if (!entry) return;
  try {
    entry.messages?.unsubscribe();
  } catch {
    /* already gone */
  }
  try {
    entry.presence?.unsubscribe();
  } catch {
    /* already gone */
  }
  roomSubscriptions.delete(key);
}

export function sendCommunityMessage(communityId, content) {
  if (!client?.connected) return false;
  client.publish({
    destination: COMMUNITY_SOCKET_DEST.send(communityId),
    body: JSON.stringify({ content }),
    headers: { "content-type": "application/json" },
  });
  return true;
}

function startClient() {
  if (manualClose || stopped) return;
  const authorization = getAuthorizationHeader();
  if (!authorization) {
    stopped = true;
    setState(COMMUNITY_SOCKET_STATES.UNAUTHORIZED, "Your session has ended. Please sign in again.");
    return;
  }

  if (client) {
    try {
      client.deactivate();
    } catch {
      /* replace the client */
    }
    client = null;
  }

  userQueuesBound = false;
  dropRoomSubscriptions();
  setState(
    state === COMMUNITY_SOCKET_STATES.RECONNECTING ? COMMUNITY_SOCKET_STATES.RECONNECTING : COMMUNITY_SOCKET_STATES.CONNECTING,
    state === COMMUNITY_SOCKET_STATES.RECONNECTING ? "Reconnecting…" : "Connecting…"
  );

  const next = new Client({
    brokerURL: communityBrokerUrl(),
    reconnectDelay: 0,
    heartbeatIncoming: COMMUNITY_HEARTBEAT_MS,
    heartbeatOutgoing: COMMUNITY_HEARTBEAT_MS,
    // CONNECT identity is the Authorization header. The handshake URL has no token.
    beforeConnect: () => {
      const header = getAuthorizationHeader();
      if (!header) {
        stopped = true;
        setState(COMMUNITY_SOCKET_STATES.UNAUTHORIZED, "Your session has ended. Please sign in again.");
        throw new Error("community-socket-unauthenticated");
      }
      next.connectHeaders = { Authorization: header };
    },
    onConnect: () => {
      connectionEpoch += 1;
      reconnectDelay = COMMUNITY_RECONNECT.INITIAL_DELAY_MS;
      bindUserQueues();
      setState(COMMUNITY_SOCKET_STATES.CONNECTED);
      console.warn("community socket", "connected");
    },
    onStompError: (frame) => {
      const kind = classifyConnectFailure(frameMessage(frame));
      if (kind === "extension") {
        stopped = true;
        setState(COMMUNITY_SOCKET_STATES.FAILED, "Use the Career-OS web session. An extension token cannot open Jobs Community.");
        return;
      }
      if (kind === "username") {
        stopped = true;
        setState(COMMUNITY_SOCKET_STATES.FAILED, AUTH_MESSAGES.COMPLETE_USERNAME);
        return;
      }
      if (kind === "unauthorized") {
        stopped = true;
        setState(COMMUNITY_SOCKET_STATES.UNAUTHORIZED, "Your session has ended. Please sign in again.");
        endSession({ redirect: true });
        return;
      }
      console.warn("community socket", "stomp-error");
    },
    onWebSocketClose: () => {
      userQueuesBound = false;
      dropRoomSubscriptions();
      if (manualClose || stopped) return;
      scheduleReconnect();
    },
    onWebSocketError: () => {
      console.warn("community socket", "ws-error");
    },
  });

  client = next;
  try {
    next.activate();
  } catch {
    if (!stopped && !manualClose) scheduleReconnect();
  }
}

export function connectCommunitySocket() {
  manualClose = false;
  if (stopped && state === COMMUNITY_SOCKET_STATES.UNAUTHORIZED) return;
  if (stopped && state === COMMUNITY_SOCKET_STATES.FAILED) return;
  stopped = false;
  if (client?.active || client?.connected) return;
  startClient();
}

export function disconnectCommunitySocket() {
  manualClose = true;
  stopped = false;
  clearReconnect();
  userQueuesBound = false;
  dropRoomSubscriptions();
  const current = client;
  client = null;
  if (current) {
    try {
      current.deactivate();
    } catch {
      /* already closed */
    }
  }
  setState(COMMUNITY_SOCKET_STATES.IDLE);
}

export function teardownCommunityRoom(communityId) {
  unsubscribeCommunityRoom(communityId);
  disconnectCommunitySocket();
}

function onBrowserOnline() {
  if (manualClose || stopped) return;
  if (client?.connected || client?.active) return;
  reconnectDelay = COMMUNITY_RECONNECT.INITIAL_DELAY_MS;
  startClient();
}

function onBrowserOffline() {
  if (manualClose || stopped) return;
  clearReconnect();
  setState(COMMUNITY_SOCKET_STATES.RECONNECTING, "Waiting for a network connection.");
}

if (typeof window !== "undefined") {
  window.addEventListener("online", onBrowserOnline);
  window.addEventListener("offline", onBrowserOffline);
}
