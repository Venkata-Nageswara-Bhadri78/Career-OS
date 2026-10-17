import { Link, useParams } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import CommunityJoinCard from "../components/main-components/CommunityJoinCard";
import CommunityLeaveDialog from "../components/main-components/CommunityLeaveDialog";
import CommunityLiveProvider from "../components/main-components/CommunityLiveProvider";
import CommunityMemberPanel from "../components/main-components/CommunityMemberPanel";
import CommunityMessagesProvider from "../components/main-components/CommunityMessagesProvider";
import CommunityRoomHeader from "../components/main-components/CommunityRoomHeader";
import CommunityTranscript from "../components/main-components/CommunityTranscript";
import CommunityConnectionStatus from "../components/sub-components/CommunityConnectionStatus";
import CommunityStatusPanel from "../components/sub-components/CommunityStatusPanel";
import { useCommunityLive } from "../hooks/communityLiveContext";
import { CommunityRoomContext } from "../hooks/communityRoomContext";
import { useCommunityRoom } from "../hooks/useCommunityRoom";

function CommunityRoomBody({ room }) {
  const live = useCommunityLive();

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <CommunityRoomHeader
        summary={room.header}
        memberCount={room.memberCount}
        onlineCount={live.onlineCount}
        presenceKnown={live.presenceKnown}
        onOpenMembers={room.openMembers}
        onLeave={room.requestLeave}
      />
      <CommunityConnectionStatus state={live.socketState} reason={live.socketReason} />
      {room.error ? (
        <p className="mx-4 mt-3 rounded-xl border border-line bg-field px-3 py-2 text-sm text-danger" role="alert">
          {room.error}
        </p>
      ) : null}
      <div className="relative flex min-h-0 min-w-0 flex-1">
        <CommunityTranscript />
        {room.membersOpen ? (
          <CommunityMemberPanel
            members={room.members}
            memberCount={room.memberCount}
            loading={room.membersLoading}
            error={room.membersError}
            onClose={room.closeMembers}
            presenceOf={live.presenceOf}
            presenceKnown={live.presenceKnown}
            onlineCount={live.onlineCount}
          />
        ) : null}
      </div>
      <CommunityLeaveDialog
        open={room.leaveOpen}
        creator={room.creator}
        busy={room.leaving}
        error={room.leaveOpen ? room.error : ""}
        onConfirm={room.confirmLeave}
        onClose={room.cancelLeave}
      />
    </div>
  );
}

export default function CommunityRoomPage() {
  const { communityId } = useParams();
  const room = useCommunityRoom(communityId);
  const membership = room.phase === "room" ? "member" : "not-member";
  const summary = room.header ?? room.preview;

  let body;
  if (room.phase === "checking" || room.phase === "loading") {
    body = <CommunityStatusPanel title="Opening this community" message="Checking your membership." busy />;
  } else if (room.phase === "unavailable") {
    body = (
      <CommunityStatusPanel title="This community is not available" message={room.error || "This community is not available."} alert>
        <Link
          to={APP_PATHS.COMMUNITY}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
        >
          Back to Jobs Community
        </Link>
      </CommunityStatusPanel>
    );
  } else if (room.phase === "error") {
    body = (
      <CommunityStatusPanel title="Jobs Community is unavailable" message={room.error || "Something went wrong."} alert>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={room.retry}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <Link
            to={APP_PATHS.COMMUNITY}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"
          >
            Back to Jobs Community
          </Link>
        </div>
      </CommunityStatusPanel>
    );
  } else if (room.phase === "joining" || room.phase === "join") {
    body = (
      <CommunityJoinCard
        summary={room.preview}
        busy={room.phase === "joining"}
        error={room.error}
        onJoin={room.join}
      />
    );
  } else {
    body = (
      <CommunityMessagesProvider
        key={communityId}
        communityId={communityId}
        enabled
        onProtectedError={room.handleProtectedFailure}
      >
        <CommunityLiveProvider communityId={communityId} onProtectedError={room.handleProtectedFailure}>
          <CommunityRoomBody room={room} />
        </CommunityLiveProvider>
      </CommunityMessagesProvider>
    );
  }

  return (
    <CommunityRoomContext.Provider value={{ membership, summary, members: room.members }}>
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden">{body}</div>
    </CommunityRoomContext.Provider>
  );
}
