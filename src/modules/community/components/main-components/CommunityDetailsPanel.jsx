import { communityJobLine, communityLabel } from "../../utils/communityDisplay";
import { formatCommunityTimestamp } from "../../utils/communityTime";

export default function CommunityDetailsPanel({ summary, memberCount, onlineCount, presenceKnown, onClose }) {
  const label = communityLabel(summary);
  const line = communityJobLine(summary);
  const created = formatCommunityTimestamp(summary?.createdAt);
  const countLabel =
    typeof memberCount === "number" ? (memberCount === 1 ? "1 active member" : `${memberCount} active members`) : "";
  const onlineLabel = presenceKnown && typeof onlineCount === "number" ? `${onlineCount} online` : "";
  const description = typeof summary?.description === "string" ? summary.description.trim() : "";

  return (
    <aside
      className="absolute inset-0 z-20 flex min-h-0 min-w-0 flex-col overflow-hidden border-line bg-white md:static md:inset-auto md:z-auto md:w-72 md:shrink-0 md:border-l"
      aria-label="Community details"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-3">
        <h2 className="min-w-0 truncate text-sm font-semibold text-ink">About</h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 items-center rounded-lg border border-line px-2 text-xs font-semibold text-ink"
        >
          Close
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
        <h3 className="text-sm font-semibold break-words text-ink">{label}</h3>
        {line && line !== label ? <p className="mt-1 text-sm leading-6 break-words text-muted">{line}</p> : null}
        {countLabel ? <p className="mt-3 text-sm text-ink">{countLabel}</p> : null}
        {onlineLabel ? <p className="mt-1 text-sm text-muted">{onlineLabel}</p> : null}
        {created ? <p className="mt-1 text-xs text-muted">Created {created}</p> : null}
        {description ? (
          <div className="mt-4">
            <h4 className="text-xs font-semibold tracking-wide text-muted uppercase">Description</h4>
            <p className="mt-2 text-sm leading-6 break-words text-ink whitespace-pre-wrap">{description}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">No description is available for this community.</p>
        )}
      </div>
    </aside>
  );
}
