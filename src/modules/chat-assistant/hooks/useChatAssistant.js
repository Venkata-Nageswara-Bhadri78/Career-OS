import { useCallback, useEffect, useRef, useState } from "react";
import { SHELL_EVENTS, emitShellEvent, subscribeShellEvent } from "../../../common/utils/shellEvents";
import {
  clearJobChat,
  getJobChatHistory,
  postJobChatMessage,
} from "../api/chatAssistantApi";
import { CHAT_ASSISTANT_LIMITS } from "../config/chatAssistantConfig";
import {
  findTurnByPrompt,
  isValidJobId,
  mapChatError,
  mapChatHistory,
  mapSendResult,
  mergeTurns,
  validatePrompt,
} from "../mappers/chatAssistantMapper";
import { clearDraft, readDraft, writeDraft } from "../utils/draftStorage";

const EMPTY_HISTORY = {
  chatSessionId: null,
  chatTitle: null,
  messages: [],
  page: 0,
  size: CHAT_ASSISTANT_LIMITS.PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
};

export default function useChatAssistant(jobId) {
  const [historyStatus, setHistoryStatus] = useState(jobId ? "loading" : "idle");
  const [sendStatus, setSendStatus] = useState("idle");
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatTitle, setChatTitle] = useState(null);
  const [messages, setMessages] = useState([]);
  const [oldestLoadedPage, setOldestLoadedPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [error, setError] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== "undefined" ? !navigator.onLine : false));
  const [retryAfter, setRetryAfter] = useState(0);
  const [jobMissing, setJobMissing] = useState(false);
  const [activeJobId, setActiveJobId] = useState(jobId);
  const [composer, setComposer] = useState(() => (isValidJobId(jobId) ? readDraft(jobId) : ""));

  const historyRequestRef = useRef(0);
  const sendRequestRef = useRef(0);
  const sendAbortRef = useRef(null);
  const sendingLockRef = useRef(false);
  const historyAbortRef = useRef(null);
  const rateLimitUntilRef = useRef(0);
  const pendingPromptRef = useRef(null);

  if (activeJobId !== jobId) {
    setActiveJobId(jobId);
    setComposer(isValidJobId(jobId) ? readDraft(jobId) : "");
    setRetryAfter(0);
    setError(null);
  }

  const hasOlder = oldestLoadedPage > 0;
  const isSending = sendStatus === "sending";
  const canSend =
    isValidJobId(jobId) &&
    !isSending &&
    !isClearing &&
    !isOffline &&
    retryAfter <= 0 &&
    !validatePrompt(composer) &&
    historyStatus !== "loading";

  const abortHistory = useCallback(() => {
    historyAbortRef.current?.abort();
    historyAbortRef.current = null;
  }, []);

  const applyHistory = useCallback((mapped) => {
    setChatSessionId(mapped.chatSessionId);
    setChatTitle(mapped.chatTitle);
    setMessages(mapped.messages);
    setTotalElements(mapped.totalElements);
    setOldestLoadedPage(mapped.page);
  }, []);

  const resetConversation = useCallback(() => {
    setChatSessionId(null);
    setChatTitle(null);
    setMessages([]);
    setOldestLoadedPage(0);
    setTotalElements(0);
    setPendingPrompt(null);
    pendingPromptRef.current = null;
    setSendStatus("idle");
    setError(null);
    setJobMissing(false);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!isValidJobId(jobId)) {
      resetConversation();
      setHistoryStatus("idle");
      return;
    }

    abortHistory();
    const controller = new AbortController();
    historyAbortRef.current = controller;
    const requestId = ++historyRequestRef.current;
    setHistoryStatus("loading");
    setError(null);
    setJobMissing(false);

    try {
      const first = mapChatHistory(await getJobChatHistory(jobId, { page: 0, size: CHAT_ASSISTANT_LIMITS.PAGE_SIZE }, { signal: controller.signal }), jobId);
      if (requestId !== historyRequestRef.current) return;

      if (first.totalPages > 1) {
        const lastPage = first.totalPages - 1;
        const newest = mapChatHistory(
          await getJobChatHistory(jobId, { page: lastPage, size: CHAT_ASSISTANT_LIMITS.PAGE_SIZE }, { signal: controller.signal }),
          jobId
        );
        if (requestId !== historyRequestRef.current) return;
        applyHistory({ ...newest, totalPages: first.totalPages, totalElements: first.totalElements });
      } else {
        applyHistory(first);
      }
      setHistoryStatus("ready");
    } catch (err) {
      if (requestId !== historyRequestRef.current) return;
      const mapped = mapChatError(err);
      if (mapped.kind === "cancelled") return;
      if (mapped.kind === "notFound") {
        setJobMissing(true);
        applyHistory({ ...EMPTY_HISTORY, jobId });
        setHistoryStatus("error");
        setError(mapped);
        emitShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, { reason: "missing", jobId });
        return;
      }
      setHistoryStatus("error");
      setError(mapped);
    }
  }, [abortHistory, applyHistory, jobId, resetConversation]);

  const loadOlder = useCallback(async () => {
    if (!isValidJobId(jobId) || !hasOlder || loadingOlder || isSending) return;
    const page = oldestLoadedPage - 1;
    setLoadingOlder(true);
    try {
      const older = mapChatHistory(
        await getJobChatHistory(jobId, { page, size: CHAT_ASSISTANT_LIMITS.PAGE_SIZE }),
        jobId
      );
      setMessages((current) => mergeTurns(older.messages, current));
      setOldestLoadedPage(page);
      setTotalElements(older.totalElements);
    } catch (err) {
      setError(mapChatError(err));
    } finally {
      setLoadingOlder(false);
    }
  }, [hasOlder, isSending, jobId, loadingOlder, oldestLoadedPage]);

  const reconcilePending = useCallback(async (prompt) => {
    if (!isValidJobId(jobId) || !prompt) return false;
    try {
      const first = mapChatHistory(await getJobChatHistory(jobId, { page: 0, size: CHAT_ASSISTANT_LIMITS.PAGE_SIZE }), jobId);
      const lastPage = Math.max(0, (first.totalPages || 1) - 1);
      const newest = lastPage === 0
        ? first
        : mapChatHistory(await getJobChatHistory(jobId, { page: lastPage, size: CHAT_ASSISTANT_LIMITS.PAGE_SIZE }), jobId);
      const found = findTurnByPrompt(newest.messages, prompt);
      applyHistory({ ...newest, totalPages: first.totalPages, totalElements: first.totalElements });
      setHistoryStatus("ready");
      return Boolean(found);
    } catch {
      return false;
    }
  }, [applyHistory, jobId]);

  const finishSendSuccess = useCallback((result) => {
    setMessages((current) => mergeTurns(current, [result.latestTurn]));
    setChatSessionId(result.chatSessionId);
    if (result.chatTitle) setChatTitle(result.chatTitle);
    setTotalElements((count) => count + 1);
    setPendingPrompt(null);
    pendingPromptRef.current = null;
    setSendStatus("idle");
    setError(null);
    clearDraft(jobId);
    emitShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, { reason: "sent", jobId });
  }, [jobId]);

  const restoreFailedPrompt = useCallback((prompt) => {
    setPendingPrompt(null);
    pendingPromptRef.current = null;
    setSendStatus("failed");
    setComposer((current) => {
      const next = String(current || "").trim() ? current : prompt;
      writeDraft(jobId, next);
      return next;
    });
  }, [jobId]);

  const sendPrompt = useCallback(async (rawPrompt) => {
    const prompt = String(rawPrompt ?? "");
    const invalid = validatePrompt(prompt);
    if (invalid) {
      setError({ kind: "validation", message: invalid, canRetry: false, uncertain: false, reconcile: false, profileLink: false, retryAfter: null });
      return;
    }
    if (!isValidJobId(jobId) || sendingLockRef.current || isClearing || retryAfter > 0) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
      setError({
        kind: "network",
        message: "You are offline. Your draft is saved until you reconnect.",
        canRetry: true,
        uncertain: false,
        reconcile: false,
        profileLink: false,
        retryAfter: null,
      });
      return;
    }

    const controller = new AbortController();
    sendAbortRef.current = controller;
    sendingLockRef.current = true;
    const requestId = ++sendRequestRef.current;

    setError(null);
    setPendingPrompt(prompt);
    pendingPromptRef.current = prompt;
    setSendStatus("sending");
    setComposer("");
    writeDraft(jobId, "");

    try {
      const result = mapSendResult(await postJobChatMessage(jobId, prompt, { signal: controller.signal }));
      if (requestId !== sendRequestRef.current) return;
      if (!result) {
        restoreFailedPrompt(prompt);
        setError(mapChatError({ status: 502 }));
        return;
      }
      finishSendSuccess(result);
    } catch (err) {
      if (requestId !== sendRequestRef.current) return;
      const mapped = mapChatError(err);

      if (mapped.kind === "notFound") {
        setJobMissing(true);
        restoreFailedPrompt(prompt);
        setError(mapped);
        emitShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, { reason: "missing", jobId });
        return;
      }

      if (mapped.kind === "rateLimit") {
        const seconds = mapped.retryAfter || 60;
        rateLimitUntilRef.current = Date.now() + seconds * 1000;
        setRetryAfter(seconds);
        restoreFailedPrompt(prompt);
        setError(mapped);
        return;
      }

      if (mapped.reconcile || mapped.uncertain) {
        const stored = await reconcilePending(prompt);
        if (requestId !== sendRequestRef.current) return;
        if (stored) {
          setPendingPrompt(null);
          pendingPromptRef.current = null;
          setSendStatus("idle");
          setError(null);
          clearDraft(jobId);
          emitShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, { reason: "sent", jobId });
          return;
        }
        restoreFailedPrompt(prompt);
        setError({
          ...mapped,
          message: mapped.kind === "cancelled"
            ? "Stopped waiting. The reply was not saved — you can send again."
            : "The reply may not have been saved. Review your draft and retry only if it is missing.",
        });
        return;
      }

      restoreFailedPrompt(prompt);
      setError(mapped);
    } finally {
      if (sendAbortRef.current === controller) sendAbortRef.current = null;
      sendingLockRef.current = false;
    }
  }, [finishSendSuccess, isClearing, jobId, reconcilePending, restoreFailedPrompt, retryAfter]);

  const stopWaiting = useCallback(() => {
    if (!isSending) return;
    sendAbortRef.current?.abort();
  }, [isSending]);

  const retryLast = useCallback(() => {
    const prompt = composer || pendingPromptRef.current;
    if (prompt) sendPrompt(prompt);
  }, [composer, sendPrompt]);

  const clearConversation = useCallback(async () => {
    if (!isValidJobId(jobId) || isSending || isClearing) return false;
    setIsClearing(true);
    setError(null);
    try {
      await clearJobChat(jobId);
      resetConversation();
      setHistoryStatus("ready");
      emitShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, { reason: "cleared", jobId });
      return true;
    } catch (err) {
      const mapped = mapChatError(err);
      if (mapped.kind === "notFound") {
        setJobMissing(true);
        resetConversation();
      }
      setError(mapped);
      return false;
    } finally {
      setIsClearing(false);
    }
  }, [isClearing, isSending, jobId, resetConversation]);

  const updateComposer = useCallback((value) => {
    setComposer(value);
    if (isValidJobId(jobId) && sendStatus !== "sending") writeDraft(jobId, value);
  }, [jobId, sendStatus]);

  const useTemplate = useCallback((prompt) => {
    updateComposer(prompt);
  }, [updateComposer]);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    rateLimitUntilRef.current = 0;
    sendRequestRef.current += 1;
    const frame = window.requestAnimationFrame(() => {
      loadHistory();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      abortHistory();
    };
  }, [abortHistory, jobId, loadHistory]);

  useEffect(() => {
    return subscribeShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, (detail) => {
      if (detail?.jobId !== jobId) return;
      if (detail?.reason === "deleted" || detail?.reason === "cleared") {
        sendAbortRef.current?.abort();
        resetConversation();
        setHistoryStatus("ready");
      }
    });
  }, [jobId, resetConversation]);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (retryAfter <= 0) return undefined;
    const timer = window.setInterval(() => {
      const left = Math.ceil((rateLimitUntilRef.current - Date.now()) / 1000);
      if (left <= 0) {
        setRetryAfter(0);
        window.clearInterval(timer);
      } else {
        setRetryAfter(left);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [retryAfter]);

  const contextTurnsUsed = Math.min(totalElements || messages.length, CHAT_ASSISTANT_LIMITS.MODEL_CONTEXT_TURNS);
  const olderTurnsHiddenFromModel = Math.max(0, (totalElements || messages.length) - CHAT_ASSISTANT_LIMITS.MODEL_CONTEXT_TURNS);

  return {
    jobId,
    isValidJob: isValidJobId(jobId),
    historyStatus,
    sendStatus,
    isSending,
    isClearing,
    isOffline,
    jobMissing,
    chatSessionId,
    chatTitle,
    messages,
    pendingPrompt,
    composer,
    error,
    retryAfter,
    canSend,
    hasOlder,
    loadingOlder,
    totalElements,
    contextTurnsUsed,
    olderTurnsHiddenFromModel,
    loadHistory,
    loadOlder,
    sendPrompt,
    stopWaiting,
    retryLast,
    clearConversation,
    updateComposer,
    useTemplate,
    dismissError,
    promptLimit: CHAT_ASSISTANT_LIMITS.PROMPT_MAX,
  };
}
