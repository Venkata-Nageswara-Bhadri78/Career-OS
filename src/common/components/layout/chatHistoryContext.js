import { createContext, useContext } from "react";

const EMPTY_SLOT = Object.freeze({
  chats: [],
  isLoading: true,
  error: "",
  currentJobId: null,
  deletingId: null,
  selectChat: () => {},
  deleteChat: async () => {},
  retry: () => {},
});

export const ChatHistorySlotContext = createContext({
  slot: EMPTY_SLOT,
  setSlot: () => {},
});

export function useChatHistorySlot() {
  return useContext(ChatHistorySlotContext).slot ?? EMPTY_SLOT;
}

export function useChatHistorySlotSetter() {
  return useContext(ChatHistorySlotContext).setSlot;
}
