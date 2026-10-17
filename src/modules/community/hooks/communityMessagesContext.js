import { createContext, useContext } from "react";

export const CommunityMessagesContext = createContext(null);

export function useCommunityMessageStore() {
  const value = useContext(CommunityMessagesContext);
  if (!value) {
    throw new Error("useCommunityMessageStore must be used within CommunityMessagesProvider.");
  }
  return value;
}
