import { createContext, useContext } from "react";

export const CommunityRoomContext = createContext(null);

export function useCommunityRoomState() {
  const value = useContext(CommunityRoomContext);
  if (!value) {
    throw new Error("useCommunityRoomState must be used within the community room.");
  }
  return value;
}
