import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import { communityJobLine, communityLabel } from "../../utils/communityDisplay";

export default function CommunityJoinCard({ summary, busy, error, onJoin }) {
  const label = summary ? communityLabel(summary) : "";
  const line = summary ? communityJobLine(summary) : "";
  const count = summary?.activeMemberCount;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col px-4 py-6 sm:px-6 sm:py-8">
      <Link to={APP_PATHS.COMMUNITY} className="text-sm font-semibold text-ink underline md:hidden">
        Communities
      </Link>
      <section className="mt-4 rounded-xl border border-line bg-field px-4 py-4 text-ink">
        <h1 className="text-lg font-semibold break-words text-ink">{label || "Join Community"}</h1>
        {line && line !== label ? <p className="mt-1 text-sm leading-6 break-words text-muted">{line}</p> : null}
        {typeof count === "number" ? (
          <p className="mt-2 text-sm text-ink">{count === 1 ? "1 active member" : `${count} active members`}</p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-ink">Join to open this community. Joining does not create a new one.</p>
        {error ? (
          <p className="mt-3 text-sm leading-6 break-words text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onJoin}
            disabled={busy}
            aria-busy={busy || undefined}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Joining…" : "Join Community"}
          </button>
          <Link
            to={APP_PATHS.COMMUNITY}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"
          >
            Cancel
          </Link>
        </div>
      </section>
    </div>
  );
}
