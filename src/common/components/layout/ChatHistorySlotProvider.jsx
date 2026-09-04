import { useCallback, useMemo, useState } from "react";
import { ChatHistorySlotContext } from "./chatHistoryContext";

const EMPTY_SLOT = {
  chats: [],
  isLoading: true,
  error: "",
  currentJobId: null,
  deletingId: null,
  selectChat: () => {},
  deleteChat: async () => {},
  retry: () => {},
};

export default function ChatHistorySlotProvider({ children }) {
  const [slot, setSlotState] = useState(EMPTY_SLOT);

  const setSlot = useCallback((next) => {
    setSlotState((prev) => ({ ...EMPTY_SLOT, ...prev, ...next }));
  }, []);

  const value = useMemo(() => ({ slot, setSlot }), [slot, setSlot]);

  return <ChatHistorySlotContext.Provider value={value}>{children}</ChatHistorySlotContext.Provider>;
}
