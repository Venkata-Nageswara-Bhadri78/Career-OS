import { COMMUNITY_MEMBERSHIP } from "../../config/communityConstants";

function jobLine(summary) {
  return [summary?.title, summary?.company, summary?.location].filter((part) => typeof part === "string" && part.trim()).join(" · ");
}

function memberCount(summary) {
  const count = summary?.activeMemberCount;
  if (typeof count !== "number" || !Number.isFinite(count)) return "";
  return count === 1 ? "1 active member" : `${count} active members`;
}

export default function CommunityMatchCard({ summary, notice, actionError, onOpen, onJoin, onCancel, onEdit }) {
  const member = summary?.membership === COMMUNITY_MEMBERSHIP.MEMBER;
  const name = typeof summary?.communityName === "string" && summary.communityName.trim() ? summary.communityName.trim() : jobLine(summary);
  const line = jobLine(summary);
  const count = memberCount(summary);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Jobs Community</h1>
      <section className="mt-5 rounded-xl border border-line bg-field px-4 py-4 text-ink">
        <h2 className="text-lg font-semibold break-words text-ink">{name || "Community"}</h2>
        {line && line !== name ? <p className="mt-1 text-sm leading-6 break-words text-muted">{line}</p> : null}
        {count ? <p className="mt-2 text-sm text-ink">{count}</p> : null}
        {notice ? <p className="mt-3 text-sm leading-6 break-words text-ink">{notice}</p> : null}
        {summary?.description ? (
          <p className="mt-3 max-h-40 overflow-y-auto text-sm leading-6 break-words text-ink">{summary.description}</p>
        ) : null}
        {actionError ? (
          <p className="mt-3 text-sm leading-6 break-words text-danger" role="alert">
            {actionError}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={member ? onOpen : onJoin}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
          >
            {member ? "Open Community" : "Join Community"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
        </div>
        {onEdit ? (
          <button type="button" onClick={onEdit} className="mt-3 text-sm font-semibold text-ink underline">
            Edit URLs
          </button>
        ) : null}
      </section>
    </div>
  );
}
