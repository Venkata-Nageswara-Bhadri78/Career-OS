import { useCallback, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_PATHS, readJobIdFromPath } from "../../../../common/config/appPaths";
import { useChatHistorySlotSetter } from "../../../../common/components/layout/chatHistoryContext";
import useChatList from "../../hooks/useChatList";

export default function ChatHistoryShellBinder() {
  const setSlot = useChatHistorySlotSetter();
  const navigate = useNavigate();
  const location = useLocation();
  const currentJobId = readJobIdFromPath(location.pathname);
  const { chats, isLoading, error, deletingId, loadChats, removeChat } = useChatList();

  const selectChat = useCallback(
    (jobId) => {
      if (!Number.isInteger(jobId) || jobId <= 0) return;
      navigate(APP_PATHS.jobChat(jobId));
    },
    [navigate]
  );

  const deleteChat = useCallback(
    async (jobId) => {
      await removeChat(jobId);
    },
    [removeChat]
  );

  useLayoutEffect(() => {
    setSlot({
      chats,
      isLoading,
      error,
      currentJobId,
      deletingId,
      selectChat,
      deleteChat,
      retry: loadChats,
    });
  }, [chats, isLoading, error, currentJobId, deletingId, selectChat, deleteChat, loadChats, setSlot]);

  return null;
}
