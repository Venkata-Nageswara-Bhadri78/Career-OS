import { CommunityMessagesContext } from "../../hooks/communityMessagesContext";
import { useCommunityMessages } from "../../hooks/useCommunityMessages";

export default function CommunityMessagesProvider({ communityId, enabled = true, onProtectedError, children }) {
  const store = useCommunityMessages(communityId, { enabled, onProtectedError });
  return <CommunityMessagesContext.Provider value={store}>{children}</CommunityMessagesContext.Provider>;
}
