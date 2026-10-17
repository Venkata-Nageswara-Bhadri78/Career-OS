import { createContext, useContext } from "react";

export const CommunityLiveContext = createContext(null);

export function useCommunityLive() {
  const value = useContext(CommunityLiveContext);
  if (!value) {
    throw new Error("useCommunityLive must be used within CommunityLiveProvider.");
  }
  return value;
}
