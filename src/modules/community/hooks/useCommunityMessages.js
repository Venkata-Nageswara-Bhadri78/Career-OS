import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCommunityMessages } from "../api/communityApi";
import { COMMUNITY_LIMITS } from "../config/communityConstants";
import {
  applyHistoryPageCursor,
  appendIfNew as appendIfNewInStore,
  createEmptyMessageStore,
  messagesFromStore,
  prependPage as prependPageInStore,
  replaceWithNewest as replaceWithNewestInStore,
} from "../utils/communityMessageStore";
import { COMMUNITY_ERROR_KINDS, classifyCommunityError, communityErrorText } from "../utils/communityErrors";

export {
  appendIfNew,
  createEmptyMessageStore,
  messagesFromStore,
  prependPage,
  replaceWithNewest,
} from "../utils/communityMessageStore";
export { isSameCommunityUser } from "../utils/communityIdentity";
export { countCommunityCodePoints, validateCommunityMessage } from "../utils/communityMessageText";

function isAbort(error) {
  return error?.status === 499;
}

const ROOM_LEAVING_KINDS = new Set([
  COMMUNITY_ERROR_KINDS.MEMBERSHIP_REQUIRED,
  COMMUNITY_ERROR_KINDS.COMMUNITY_UNAVAILABLE,
  COMMUNITY_ERROR_KINDS.ACCOUNT_REQUIRED,
  COMMUNITY_ERROR_KINDS.TERMS_CHANGED,
]);

export function useCommunityMessages(communityId, { enabled = true, onProtectedError } = {}) {
  const [store, setStore] = useState(createEmptyMessageStore);
  const [status, setStatus] = useState(enabled ? "loading" : "idle");
  const [error, setError] = useState("");
  const [olderStatus, setOlderStatus] = useState("idle");
  const [olderError, setOlderError] = useState("");

  const storeRef = useRef(store);
  const paneRef = useRef(null);
  const newestAbortRef = useRef(null);
  const olderAbortRef = useRef(null);
  const olderCursorRef = useRef(null);
  const generationRef = useRef(0);
  const communityIdRef = useRef(communityId);
  const enabledRef = useRef(enabled);
  const onProtectedErrorRef = useRef(onProtectedError);
  const pendingScrollRef = useRef(null);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    communityIdRef.current = communityId;
    enabledRef.current = enabled;
    onProtectedErrorRef.current = onProtectedError;
  }, [communityId, enabled, onProtectedError]);

  const sameRoom = useCallback((requestId, requestedId) => {
    return (
      requestId === generationRef.current &&
      enabledRef.current &&
      String(communityIdRef.current) === String(requestedId)
    );
  }, []);

  const handleProtected = useCallback((classified) => {
    if (!ROOM_LEAVING_KINDS.has(classified.kind)) return false;
    onProtectedErrorRef.current?.(classified);
    return true;
  }, []);

  const loadNewest = useCallback(async () => {
    if (!enabledRef.current || communityId == null || communityId === "") return;
    const requestedId = communityId;
    const requestId = ++generationRef.current;
    newestAbortRef.current?.abort();
    olderAbortRef.current?.abort();
    olderCursorRef.current = null;
    const controller = new AbortController();
    newestAbortRef.current = controller;

    setStore(createEmptyMessageStore());
    setStatus("loading");
    setError("");
    setOlderStatus("idle");
    setOlderError("");
    pendingScrollRef.current = null;

    try {
      const page = await getCommunityMessages(requestedId, {
        limit: COMMUNITY_LIMITS.PAGE_SIZE,
        signal: controller.signal,
      });
      if (!sameRoom(requestId, requestedId)) return;
      pendingScrollRef.current = { type: "bottom" };
      setStore(replaceWithNewestInStore(createEmptyMessageStore(), page));
      setStatus("ready");
      setError("");
    } catch (err) {
      if (!sameRoom(requestId, requestedId) || isAbort(err)) return;
      const classified = classifyCommunityError(err);
      if (handleProtected(classified)) return;
      setStatus("error");
      setError(communityErrorText(classified));
    }
  }, [communityId, handleProtected, sameRoom]);

  const loadOlder = useCallback(async () => {
    if (!enabledRef.current || communityId == null || communityId === "") return;
    const requestedId = communityId;
    const current = storeRef.current;
    const cursor = current.nextCursor;
    if (!current.hasMore || !cursor) return;
    if (olderCursorRef.current === cursor) return;

    olderCursorRef.current = cursor;
    olderAbortRef.current?.abort();
    const controller = new AbortController();
    olderAbortRef.current = controller;
    const requestId = generationRef.current;
    setOlderStatus("loading");
    setOlderError("");

    try {
      const page = await getCommunityMessages(requestedId, {
        cursor,
        limit: COMMUNITY_LIMITS.PAGE_SIZE,
        signal: controller.signal,
      });
      if (!sameRoom(requestId, requestedId) || olderCursorRef.current !== cursor) return;
      const pane = paneRef.current;
      if (pane) {
        pendingScrollRef.current = { type: "preserve", height: pane.scrollHeight, top: pane.scrollTop };
      }
      setStore((prev) => applyHistoryPageCursor(prependPageInStore(prev, page.messages), page));
      setOlderStatus("idle");
      setOlderError("");
    } catch (err) {
      if (!sameRoom(requestId, requestedId) || isAbort(err)) return;
      const classified = classifyCommunityError(err);
      if (classified.kind === COMMUNITY_ERROR_KINDS.INVALID_CURSOR) {
        olderCursorRef.current = null;
        await loadNewest();
        return;
      }
      if (handleProtected(classified)) return;
      setOlderStatus("error");
      setOlderError(communityErrorText(classified));
    } finally {
      if (olderCursorRef.current === cursor) olderCursorRef.current = null;
    }
  }, [communityId, handleProtected, loadNewest, sameRoom]);

  const reloadNewest = useCallback(async () => {
    if (!enabledRef.current || communityId == null || communityId === "") return null;
    const requestedId = communityId;
    const requestId = ++generationRef.current;
    newestAbortRef.current?.abort();
    const controller = new AbortController();
    newestAbortRef.current = controller;
    try {
      const page = await getCommunityMessages(requestedId, {
        limit: COMMUNITY_LIMITS.PAGE_SIZE,
        signal: controller.signal,
      });
      if (!sameRoom(requestId, requestedId)) return null;
      setStore((prev) => replaceWithNewestInStore(prev, page));
      setStatus("ready");
      setError("");
      return page;
    } catch (err) {
      if (!sameRoom(requestId, requestedId) || isAbort(err)) return null;
      const classified = classifyCommunityError(err);
      if (handleProtected(classified)) return null;
      return null;
    }
  }, [communityId, handleProtected, sameRoom]);

  const prependPage = useCallback((messages) => {
    setStore((prev) => prependPageInStore(prev, messages));
  }, []);

  const appendIfNew = useCallback((message) => {
    setStore((prev) => appendIfNewInStore(prev, message));
  }, []);

  const replaceWithNewest = useCallback((page) => {
    setStore((prev) => replaceWithNewestInStore(prev, page));
  }, []);

  const scrollToNewest = useCallback(() => {
    const pane = paneRef.current;
    if (!pane) return;
    pane.scrollTop = pane.scrollHeight;
  }, []);

  useEffect(() => {
    if (!enabled || communityId == null || communityId === "") {
      newestAbortRef.current?.abort();
      olderAbortRef.current?.abort();
      olderCursorRef.current = null;
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      void loadNewest();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      generationRef.current += 1;
      newestAbortRef.current?.abort();
      olderAbortRef.current?.abort();
      olderCursorRef.current = null;
    };
  }, [communityId, enabled, loadNewest]);

  const messages = useMemo(() => messagesFromStore(store), [store]);

  return {
    messages,
    byId: store.byId,
    hasMore: store.hasMore,
    nextCursor: store.nextCursor,
    status,
    error,
    olderStatus,
    olderError,
    olderLoading: olderStatus === "loading",
    loadNewest,
    reloadNewest,
    loadOlder,
    prependPage,
    appendIfNew,
    replaceWithNewest,
    paneRef,
    pendingScrollRef,
    scrollToNewest,
  };
}
