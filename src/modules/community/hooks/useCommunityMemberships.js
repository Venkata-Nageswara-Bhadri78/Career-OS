import { useContext } from "react";
import { CommunityMembershipsContext } from "./communityMembershipsContext";

export function useCommunityMemberships() {
  const value = useContext(CommunityMembershipsContext);
  if (!value) {
    throw new Error("useCommunityMemberships must be used within CommunityMembershipsProvider.");
  }
  return value;
}
