import { createContext, useContext } from "react";

const EMPTY_SLOT = Object.freeze({
  communities: [],
  status: "idle",
  isLoading: false,
  error: "",
  currentCommunityId: null,
  selectCommunity: () => {},
  retry: () => {},
  refresh: () => {},
  activate: () => {},
});

export const CommunityListSlotContext = createContext({
  slot: EMPTY_SLOT,
  setSlot: () => {},
});

export function useCommunityListSlot() {
  return useContext(CommunityListSlotContext).slot ?? EMPTY_SLOT;
}

export function useCommunityListSlotSetter() {
  return useContext(CommunityListSlotContext).setSlot;
}
