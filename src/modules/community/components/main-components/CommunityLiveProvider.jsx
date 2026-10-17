import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../auth/hooks/useAuth";
import {
  connectCommunitySocket,
  getCommunitySocketState,
  sendCommunityMessage,
  subscribeCommunityRoom,
  subscribeCommunitySocket,
  teardownCommunityRoom,
  unsubscribeCommunityRoom,
} from "../../api/communitySocket";
import {
  COMMUNITY_SEND_TIMEOUT_MS,
  COMMUNITY_SOCKET_CODES,
  COMMUNITY_SOCKET_STATES,
} from "../../config/communityConstants";
import { CommunityLiveContext } from "../../hooks/communityLiveContext";
import { useCommunityMessageStore } from "../../hooks/communityMessagesContext";
import { useCommunityAccount } from "../../hooks/useCommunityAccount";
import { useCommunityMemberships } from "../../hooks/useCommunityMemberships";
import { classifyCommunityError } from "../../utils/communityErrors";
import { isSameCommunityUser } from "../../utils/communityIdentity";
import { onlineIdSet, presenceStatus } from "../../utils/communityPresence";

const DELIVERY_UNCONFIRMED = "Delivery not confirmed. Check the conversation before resending.";

function sameRoomId(left, right) {
  if (left == null || right == null) return false;
  return String(left) === String(right);
}

function protectedError(kind, message) {
  const status = kind === COMMUNITY_SOCKET_CODES.COMMUNITY_UNAVAILABLE ? 404 : 403;
  const sentence =
    message ||
    (kind === COMMUNITY_SOCKET_CODES.COMMUNITY_UNAVAILABLE
      ? "This community is not available."
      : kind === COMMUNITY_SOCKET_CODES.ACCOUNT_REQUIRED
        ? "A community account is required. Accept the current terms to create one."
        : kind === COMMUNITY_SOCKET_CODES.TERMS_REQUIRED
          ? "The community terms have changed. Accept the current version to continue."
          : "Join this community to continue.");
  return classifyCommunityError({ status, message: sentence });
}

export default function CommunityLiveProvider({ communityId, onProtectedError, children }) {
  const { user } = useAuth();
  const { refresh: refreshAccount } = useCommunityAccount();
  const memberships = useCommunityMemberships();
  const history = useCommunityMessageStore();
  const [socket, setSocket] = useState(() => getCommunitySocketState());
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [presenceKnown, setPresenceKnown] = useState(false);
  const [onlineIds, setOnlineIds] = useState(() => new Set());

  const pendingRef = useRef(null);
  const timeoutRef = useRef(null);
  const bufferRef = useRef([]);
  const historyReadyRef = useRef(false);
  const presenceKnownRef = useRef(false);
  const epochSeenRef = useRef(0);
  const communityIdRef = useRef(communityId);
  const userIdRef = useRef(user?.id);
  const onProtectedErrorRef = useRef(onProtectedError);
  const historyRef = useRef(history);
  const refreshAccountRef = useRef(refreshAccount);
  const membershipsRef = useRef(memberships);

  useEffect(() => {
    communityIdRef.current = communityId;
    userIdRef.current = user?.id;
    onProtectedErrorRef.current = onProtectedError;
    historyRef.current = history;
    refreshAccountRef.current = refreshAccount;
    membershipsRef.current = memberships;
    historyReadyRef.current = history.status === "ready" || history.status === "error";
  }, [communityId, history, memberships, onProtectedError, refreshAccount, user?.id]);

  const clearPendingTimer = () => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const matchesPending = (message) => {
    const pending = pendingRef.current;
    if (!pending || !message) return false;
    if (!isSameCommunityUser(message.sender?.userId, userIdRef.current)) return false;
    return message.content === pending.text;
  };

  const acceptPending = (message) => {
    if (!matchesPending(message)) return false;
    clearPendingTimer();
    pendingRef.current = null;
    setSending(false);
    setDraft("");
    setNotice("");
    if (historyRef.current.pendingScrollRef) {
      historyRef.current.pendingScrollRef.current = { type: "bottom" };
    }
    return true;
  };

  const ingestMessage = (message) => {
    if (!message) return;
    acceptPending(message);
    historyRef.current.appendIfNew(message);
  };

  const leaveProtected = (kind, message) => {
    clearPendingTimer();
    pendingRef.current = null;
    setSending(false);
    unsubscribeCommunityRoom(communityIdRef.current);
    presenceKnownRef.current = false;
    setPresenceKnown(false);
    setOnlineIds(new Set());
    onProtectedErrorRef.current?.(protectedError(kind, message));
    if (kind === COMMUNITY_SOCKET_CODES.MEMBERSHIP_REQUIRED) {
      membershipsRef.current.dropCommunity(communityIdRef.current);
      membershipsRef.current.refresh();
    }
  };

  const handleSocketEvent = (event) => {
    if (event.type === "state") {
      setSocket({ state: event.state, reason: event.reason, connectionEpoch: event.connectionEpoch });
      if (event.state !== COMMUNITY_SOCKET_STATES.CONNECTED) {
        presenceKnownRef.current = false;
        setPresenceKnown(false);
        setOnlineIds(new Set());
      }
      return;
    }

    if (event.type === "message") {
      if (!sameRoomId(event.communityId, communityIdRef.current)) return;
      if (!historyReadyRef.current) {
        bufferRef.current.push(event.message);
        return;
      }
      ingestMessage(event.message);
      return;
    }

    if (event.type === "snapshot") {
      if (!sameRoomId(event.communityId, communityIdRef.current)) return;
      presenceKnownRef.current = true;
      setOnlineIds(onlineIdSet(event.online));
      setPresenceKnown(true);
      return;
    }

    if (event.type === "presence") {
      if (!presenceKnownRef.current) return;
      if (!sameRoomId(event.communityId, communityIdRef.current)) return;
      setOnlineIds((current) => {
        const next = new Set(current);
        const key = event.userId == null ? "" : String(event.userId);
        if (!key) return current;
        if (event.status === "ONLINE") next.add(key);
        else if (event.status === "OFFLINE") next.delete(key);
        return next;
      });
      return;
    }

    if (event.type === "membership") {
      if (!sameRoomId(event.communityId, communityIdRef.current)) return;
      if (event.userId != null && !isSameCommunityUser(event.userId, userIdRef.current)) return;
      if (event.membership === "NOT_A_MEMBER") {
        leaveProtected(COMMUNITY_SOCKET_CODES.MEMBERSHIP_REQUIRED, "Join this community to continue.");
        return;
      }
      if (event.membership === "MEMBER") {
        subscribeCommunityRoom(communityIdRef.current);
      }
      return;
    }

    if (event.type !== "error") return;
    const code = event.code;
    if (code === COMMUNITY_SOCKET_CODES.INVALID_MESSAGE || code === COMMUNITY_SOCKET_CODES.SEND_FAILED) {
      clearPendingTimer();
      const text = pendingRef.current?.text;
      pendingRef.current = null;
      setSending(false);
      if (typeof text === "string") setDraft(text);
      setNotice(
        event.message ||
          (code === COMMUNITY_SOCKET_CODES.SEND_FAILED ? "The message could not be sent." : "Message text is invalid.")
      );
      return;
    }
    if (code === COMMUNITY_SOCKET_CODES.MEMBERSHIP_REQUIRED) {
      leaveProtected(code, event.message);
      return;
    }
    if (code === COMMUNITY_SOCKET_CODES.ACCOUNT_REQUIRED || code === COMMUNITY_SOCKET_CODES.TERMS_REQUIRED) {
      clearPendingTimer();
      pendingRef.current = null;
      setSending(false);
      void refreshAccountRef.current?.();
      return;
    }
    if (code === COMMUNITY_SOCKET_CODES.COMMUNITY_UNAVAILABLE) {
      leaveProtected(code, event.message);
      return;
    }
    if (code === COMMUNITY_SOCKET_CODES.DESTINATION_NOT_ALLOWED) {
      setNotice(event.message || "That destination is not available.");
      console.warn("community socket", "destination-not-allowed");
    }
  };

  const handlerRef = useRef(handleSocketEvent);
  useEffect(() => {
    handlerRef.current = handleSocketEvent;
  });

  useEffect(() => {
    if (history.status !== "ready" && history.status !== "error") return;
    const queued = bufferRef.current;
    bufferRef.current = [];
    queued.forEach((message) => {
      const pending = pendingRef.current;
      if (
        pending &&
        message &&
        isSameCommunityUser(message.sender?.userId, userIdRef.current) &&
        message.content === pending.text
      ) {
        clearPendingTimer();
        pendingRef.current = null;
        setSending(false);
        setDraft("");
        setNotice("");
        if (historyRef.current.pendingScrollRef) {
          historyRef.current.pendingScrollRef.current = { type: "bottom" };
        }
      }
      historyRef.current.appendIfNew(message);
    });
  }, [history.status]);

  useEffect(() => {
    const unsub = subscribeCommunitySocket((event) => handlerRef.current(event));
    const frame = window.requestAnimationFrame(() => {
      connectCommunitySocket();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      unsub();
      unsubscribeCommunityRoom(communityId);
      clearPendingTimer();
      bufferRef.current = [];
      pendingRef.current = null;
    };
  }, [communityId]);

  useEffect(() => {
    if (socket.state !== COMMUNITY_SOCKET_STATES.CONNECTED) return;
    subscribeCommunityRoom(communityId);
    if (epochSeenRef.current === 0) {
      epochSeenRef.current = socket.connectionEpoch || 1;
      return;
    }
    if (socket.connectionEpoch && socket.connectionEpoch !== epochSeenRef.current) {
      epochSeenRef.current = socket.connectionEpoch;
      void historyRef.current.reloadNewest();
    }
  }, [communityId, socket.connectionEpoch, socket.state]);

  const send = useCallback((trimmedText) => {
    if (pendingRef.current) return;
    if (getCommunitySocketState().state !== COMMUNITY_SOCKET_STATES.CONNECTED) return;
    const published = sendCommunityMessage(communityId, trimmedText);
    if (!published) {
      setNotice("Disconnected. Messages cannot be sent until the connection returns.");
      return;
    }
    pendingRef.current = { text: trimmedText };
    setSending(true);
    setNotice("");
    clearPendingTimer();
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      const waiting = pendingRef.current?.text;
      pendingRef.current = null;
      setSending(false);
      setNotice(DELIVERY_UNCONFIRMED);
      void historyRef.current.reloadNewest?.().then((page) => {
        const match = page?.messages?.find((message) => {
          if (!isSameCommunityUser(message.sender?.userId, userIdRef.current)) return false;
          return message.content === waiting;
        });
        if (match) {
          setDraft("");
          setNotice("");
          if (historyRef.current.pendingScrollRef) {
            historyRef.current.pendingScrollRef.current = { type: "bottom" };
          }
        }
      });
    }, COMMUNITY_SEND_TIMEOUT_MS);
  }, [communityId]);

  const connected = socket.state === COMMUNITY_SOCKET_STATES.CONNECTED;
  const canSend = connected && !sending;
  const teardown = useCallback(() => teardownCommunityRoom(communityId), [communityId]);

  const value = useMemo(
    () => ({
      socketState: socket.state,
      socketReason: socket.reason,
      connected,
      canSend,
      sending,
      notice,
      draft,
      setDraft,
      send,
      presenceKnown,
      onlineCount: presenceKnown ? onlineIds.size : 0,
      presenceOf: (userId) => presenceStatus(presenceKnown, onlineIds, userId),
      teardown,
    }),
    [canSend, connected, draft, notice, onlineIds, presenceKnown, send, sending, socket.reason, socket.state, teardown]
  );

  return <CommunityLiveContext.Provider value={value}>{children}</CommunityLiveContext.Provider>;
}
