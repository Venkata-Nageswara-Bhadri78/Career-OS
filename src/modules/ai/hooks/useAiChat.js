import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat } from "../api/aiApi";
import { mapAiError, validatePrompt } from "../mappers/aiMapper";

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function useAiChat(grounding) {
  const [messages, setMessages] = useState([]);
  const [composer, setComposer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== "undefined" ? !navigator.onLine : false));

  const abortRef = useRef(null);
  const sendLockRef = useRef(false);
  const requestRef = useRef(0);
  const rateLimitUntilRef = useRef(0);

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
      const remaining = Math.max(0, Math.ceil((rateLimitUntilRef.current - Date.now()) / 1000));
      setRetryAfter(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [retryAfter]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const applyMappedError = useCallback((mapped) => {
    setError(mapped);
    if (mapped.retryAfter) {
      rateLimitUntilRef.current = Date.now() + mapped.retryAfter * 1000;
      setRetryAfter(mapped.retryAfter);
    }
  }, []);

  const canStartRequest =
    !isStreaming &&
    !isOffline &&
    retryAfter <= 0 &&
    !grounding.resumeBlocksSend &&
    !grounding.resumePasteError &&
    !grounding.jobPasteError &&
    !grounding.temperatureError;

  const canSend = canStartRequest && !validatePrompt(composer);

  const send = useCallback(
    async (rawPrompt) => {
      const prompt = typeof rawPrompt === "string" ? rawPrompt : composer;
      const promptError = validatePrompt(prompt);
      if (promptError) {
        setError({ kind: "validation", message: promptError, canRetry: false, profileLink: false, retryAfter: null });
        return;
      }
      if (sendLockRef.current || isStreaming || isOffline || retryAfter > 0 || grounding.resumeBlocksSend) return;
      if (grounding.resumePasteError || grounding.jobPasteError || grounding.temperatureError) return;

      sendLockRef.current = true;
      const requestId = ++requestRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage = {
        id: nextId("user"),
        role: "user",
        content: prompt,
        createdAt: new Date().toISOString(),
      };
      const assistantId = nextId("ai");
      const assistantMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        mode: grounding.mode,
        createdAt: new Date().toISOString(),
      };

      setComposer("");
      setError(null);
      setIsStreaming(true);
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      try {
        const result = await streamChat(
          {
            prompt,
            mode: grounding.mode,
            customResumeText: grounding.customResumeText,
            jobDescription: grounding.jobDescription,
            jobId: grounding.usingPastedJob ? null : grounding.jobId,
            temperature: grounding.temperature,
          },
          {
            onToken: (_delta, accumulated) => {
              if (requestId !== requestRef.current) return;
              setMessages((prev) =>
                prev.map((message) => (message.id === assistantId ? { ...message, content: accumulated } : message))
              );
            },
          },
          { signal: controller.signal }
        );

        if (requestId !== requestRef.current) return;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? { ...message, content: result?.content || message.content || "The model returned an empty reply." }
              : message
          )
        );
        setIsStreaming(false);
      } catch (err) {
        if (requestId !== requestRef.current) return;
        const mapped = mapAiError(err);
        if (mapped.kind === "cancelled") {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((message) => (message.id === assistantId ? { ...message, stopped: true } : message))
          );
          return;
        }
        applyMappedError(mapped);
        setIsStreaming(false);
        setMessages((prev) =>
          prev.flatMap((message) => {
            if (message.id !== assistantId) return [message];
            if (!message.content.trim()) return [];
            return [{ ...message, failed: true }];
          })
        );
      } finally {
        if (requestId === requestRef.current) {
          sendLockRef.current = false;
          abortRef.current = null;
          setIsStreaming(false);
        }
      }
    },
    [
      applyMappedError,
      composer,
      grounding.customResumeText,
      grounding.jobDescription,
      grounding.jobId,
      grounding.jobPasteError,
      grounding.mode,
      grounding.resumeBlocksSend,
      grounding.resumePasteError,
      grounding.temperature,
      grounding.temperatureError,
      grounding.usingPastedJob,
      isOffline,
      isStreaming,
      retryAfter,
    ]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retryLast = useCallback(async () => {
    if (isStreaming) return;
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser?.content) return;
    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === lastUser.id);
      return index === -1 ? prev : prev.slice(0, index);
    });
    await send(lastUser.content);
  }, [isStreaming, messages, send]);

  const newSession = useCallback(() => {
    abortRef.current?.abort();
    requestRef.current += 1;
    sendLockRef.current = false;
    abortRef.current = null;
    setIsStreaming(false);
    setError(null);
    setMessages([]);
    setComposer("");
  }, []);

  return {
    messages,
    composer,
    setComposer,
    isStreaming,
    error,
    retryAfter,
    isOffline,
    canSend,
    canStartRequest,
    send,
    stop,
    retryLast,
    newSession,
  };
}
