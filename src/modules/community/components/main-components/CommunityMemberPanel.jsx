import { communityInitials } from "../../utils/communityDisplay";
import { formatCommunityTimestamp } from "../../utils/communityTime";
import CommunityPresenceDot from "../sub-components/CommunityPresenceDot";

export default function CommunityMemberPanel({
  members,
  memberCount,
  loading,
  error,
  onClose,
  presenceOf,
  presenceKnown,
  onlineCount,
}) {
  const countLabel =
    typeof memberCount === "number" ? (memberCount === 1 ? "1 active member" : `${memberCount} active members`) : "";
  const onlineLabel = presenceKnown && typeof onlineCount === "number" ? `${onlineCount} online` : "";

  return (
    <aside
      className="absolute inset-0 z-20 flex min-h-0 min-w-0 flex-col overflow-hidden border-line bg-white md:static md:inset-auto md:z-auto md:w-72 md:shrink-0 md:border-l"
      aria-label="Community members"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">Members</h2>
          {countLabel ? <p className="truncate text-xs text-muted">{countLabel}</p> : null}
          {onlineLabel ? <p className="truncate text-xs text-muted">{onlineLabel}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 items-center rounded-lg border border-line px-2 text-xs font-semibold text-ink"
        >
          Close
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        {loading ? <p className="px-2 py-3 text-sm text-muted">Loading members…</p> : null}
        {error ? (
          <p className="px-2 py-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <ul className="flex flex-col">
          {members.map((member) => {
            const name = member?.displayName || member?.username || "Member";
            const joined = formatCommunityTimestamp(member?.joinedAt);
            const presence = presenceOf?.(member?.userId) || "unknown";
            return (
              <li key={member?.userId ?? name} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2">
                <span
                  aria-hidden="true"
                  className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-field text-[10px] font-semibold text-ink"
                >
                  {communityInitials(name)}
                  <CommunityPresenceDot status={presence} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{name}</span>
                  {joined ? <span className="block truncate text-xs text-muted">Joined {joined}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
