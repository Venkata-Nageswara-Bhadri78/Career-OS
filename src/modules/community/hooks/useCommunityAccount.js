import { useContext } from "react";
import { CommunityAccountContext } from "./communityAccountContext";

export function useCommunityAccount() {
  const value = useContext(CommunityAccountContext);
  if (!value) {
    throw new Error("useCommunityAccount must be used within CommunityAccountProvider.");
  }
  return value;
}
