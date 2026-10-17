import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import { communityJobLine, communityLabel } from "../../utils/communityDisplay";
import { formatCommunityTimestamp } from "../../utils/communityTime";

export default function CommunityRoomHeader({ summary, memberCount, onlineCount, presenceKnown, onOpenMembers, onLeave }) {
  const label = communityLabel(summary);
  const line = communityJobLine(summary);
  const created = formatCommunityTimestamp(summary?.createdAt);
  const countLabel =
    typeof memberCount === "number" ? (memberCount === 1 ? "1 active member" : `${memberCount} active members`) : "";
  const onlineLabel = presenceKnown && typeof onlineCount === "number" ? `${onlineCount} online` : "";

  return (
    <header className="shrink-0 border-b border-line px-4 py-3">
      <Link to={APP_PATHS.COMMUNITY} className="text-sm font-semibold text-ink underline md:hidden">
        Communities
      </Link>
      <div className="mt-2 flex min-w-0 flex-col gap-3 md:mt-0 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-ink" title={label}>
            {label}
          </h1>
          {line && line !== label ? <p className="truncate text-sm text-muted">{line}</p> : null}
          {countLabel ? <p className="mt-1 text-sm text-ink">{countLabel}</p> : null}
          {onlineLabel ? <p className="text-xs text-muted">{onlineLabel}</p> : null}
          {created ? <p className="text-xs text-muted">Created {created}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onOpenMembers}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink"
          >
            Members
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-danger px-3 text-sm font-semibold text-white"
          >
            Leave community
          </button>
        </div>
      </div>
      {summary?.description ? (
        <details className="mt-3 rounded-lg border border-line bg-field px-3 py-2">
          <summary className="cursor-pointer text-sm font-semibold text-ink">Description</summary>
          <p className="mt-2 max-h-40 overflow-y-auto text-sm leading-6 break-words text-ink">{summary.description}</p>
        </details>
      ) : null}
    </header>
  );
}
