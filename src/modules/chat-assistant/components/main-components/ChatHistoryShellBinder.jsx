import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_PATHS, readJobIdFromPath } from "../../../../common/config/appPaths";
import { useChatHistorySlotSetter } from "../../../../common/components/layout/chatHistoryContext";
import { CLIENT_COPY } from "../../../../common/api/apiError";
import { SHELL_EVENTS, subscribeShellEvent } from "../../../../common/utils/shellEvents";
import { deleteJobChat, fetchChatList } from "../../api/chatAssistantApi";
import { mapChatList } from "../../mappers/chatAssistantMapper";

export default function ChatHistoryShellBinder() {
  const setSlot = useChatHistorySlotSetter();
  const navigate = useNavigate();
  const location = useLocation();
  const currentJobId = readJobIdFromPath(location.pathname);
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
      let nextChats = mapChatList(first);
      const totalPages = Number(first?.data?.totalPages) || 1;
      for (let page = 1; page < totalPages; page += 1) {
        const payload = await fetchChatList({ page, size: 50 });
        if (requestId !== requestIdRef.current) return;
        nextChats = nextChats.concat(mapChatList(payload));
      }
      setChats(nextChats);
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
    const unsubscribe = subscribeShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, loadChats);
    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [loadChats]);

  const selectChat = useCallback(
    (jobId) => {
      if (!Number.isInteger(jobId) || jobId <= 0) return;
      navigate(APP_PATHS.jobChat(jobId));
    },
    [navigate]
  );

  const removeChat = useCallback(
    async (jobId) => {
      if (!Number.isInteger(jobId) || jobId <= 0 || deletingId) return;
      setDeletingId(jobId);
      try {
        await deleteJobChat(jobId);
        setChats((current) => current.filter((chat) => chat.jobId !== jobId));
        if (currentJobId === jobId) navigate(APP_PATHS.DASHBOARD);
      } catch (err) {
        setError(err?.message || "Unable to delete that chat.");
      } finally {
        setDeletingId(null);
      }
    },
    [currentJobId, deletingId, navigate]
  );

  useLayoutEffect(() => {
    setSlot({
      chats,
      isLoading,
      error,
      currentJobId,
      deletingId,
      selectChat,
      deleteChat: removeChat,
      retry: loadChats,
    });
  }, [chats, isLoading, error, currentJobId, deletingId, selectChat, removeChat, loadChats, setSlot]);

  return null;
}
