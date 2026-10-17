import { Link } from "react-router-dom";
import { MenuIcon } from "../../../../common/components/layout/ShellIcons";
import { APP_PATHS } from "../../../../common/config/appPaths";
import { communityLabel } from "../../utils/communityDisplay";

export default function CommunityRoomHeader({
  summary,
  onlineCount,
  presenceKnown,
  onOpenMembers,
  onOpenDetails,
  onLeave,
}) {
  const label = communityLabel(summary);
  const onlineLabel = presenceKnown && typeof onlineCount === "number" ? `${onlineCount} online` : "";

  return (
    <header className="shrink-0 border-b border-line px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link to={APP_PATHS.COMMUNITY} className="shrink-0 text-sm font-semibold text-ink underline md:hidden">
          Communities
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-ink sm:text-lg" title={label}>
          {label}
        </h1>
        {onlineLabel ? <p className="hidden shrink-0 text-xs text-muted sm:block">{onlineLabel}</p> : null}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMembers}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink"
          >
            Members
          </button>
          <button
            type="button"
            onClick={onLeave}
            aria-label="Leave community"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-danger px-3 text-sm font-semibold text-white"
          >
            Leave
          </button>
          <button
            type="button"
            onClick={onOpenDetails}
            aria-label="Community details"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      {onlineLabel ? <p className="mt-1 truncate text-xs text-muted sm:hidden">{onlineLabel}</p> : null}
    </header>
  );
}
