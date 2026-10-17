import CommunityComposer from "./CommunityComposer";
import CommunityMessageList from "./CommunityMessageList";
import { useCommunityLive } from "../../hooks/communityLiveContext";

export default function CommunityTranscript() {
  const live = useCommunityLive();

  return (
    <div data-community-transcript className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <CommunityMessageList />
      <CommunityComposer
        value={live.draft}
        onChange={live.setDraft}
        canSend={live.canSend}
        disabled={!live.connected}
        sending={live.sending}
        notice={live.notice}
        onSubmit={live.send}
      />
    </div>
  );
}
