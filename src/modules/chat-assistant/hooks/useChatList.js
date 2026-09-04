import { useCallback, useEffect, useRef, useState } from "react";
import { CLIENT_COPY } from "../../../common/api/apiError";
import { SHELL_EVENTS, emitShellEvent, subscribeShellEvent } from "../../../common/utils/shellEvents";
import { fetchChatList, deleteJobChat } from "../api/chatAssistantApi";
import { isValidJobId, mapChatList } from "../mappers/chatAssistantMapper";

export default function useChatList() {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const requestIdRef = useRef(0);

  const loadChats = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");
    try {
      const first = await fetchChatList({ page: 0, size: 50 });
      if (requestId !== requestIdRef.current) return;
      const mapped = mapChatList(first);
      let nextChats = mapped.chats;
      const totalPages = mapped.totalPages || 1;
      for (let page = 1; page < totalPages; page += 1) {
        const payload = await fetchChatList({ page, size: 50 });
        if (requestId !== requestIdRef.current) return;
        nextChats = nextChats.concat(mapChatList(payload).chats);
      }
      const seen = new Set();
      setChats(
        nextChats.filter((chat) => {
          if (seen.has(chat.jobId)) return false;
          seen.add(chat.jobId);
          return true;
        })
      );
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err?.message || CLIENT_COPY.generic);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      loadChats();
    });
    const unsubscribe = subscribeShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, (detail) => {
      if (detail?.reason === "deleted") return;
      loadChats();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
      requestIdRef.current += 1;
    };
  }, [loadChats]);

  const removeChat = useCallback(async (jobId) => {
    if (!isValidJobId(jobId) || deletingId) return false;
    setDeletingId(jobId);
    try {
      await deleteJobChat(jobId);
      setChats((current) => current.filter((chat) => chat.jobId !== jobId));
      emitShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, { reason: "deleted", jobId });
      return true;
    } catch (err) {
      setError(err?.message || "Unable to delete that chat.");
      return false;
    } finally {
      setDeletingId(null);
    }
  }, [deletingId]);

  return {
    chats,
    isLoading,
    error,
    deletingId,
    loadChats,
    removeChat,
  };
}
