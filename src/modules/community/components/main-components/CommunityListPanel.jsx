import { useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import { ChevronIcon } from "../../../../common/components/layout/ShellIcons";
import { useCommunityListSlot } from "../../hooks/communityListContext";
import { communityInitials, communityJobLine, communityLabel, isCommunityAreaPath } from "../../utils/communityDisplay";
import "../../styles/community.css";

export default function CommunityListPanel() {
  const location = useLocation();
  const slot = useCommunityListSlot();
  const [expanded, setExpanded] = useState(() => isCommunityAreaPath(location.pathname));
  const labelId = useId();
  const bodyId = useId();
  const active = isCommunityAreaPath(location.pathname);
  const [seenPath, setSeenPath] = useState(location.pathname);
  if (seenPath !== location.pathname) {
    setSeenPath(location.pathname);
    if (active) setExpanded(true);
  }
  const communities = Array.isArray(slot.communities) ? slot.communities : [];

  return (
    <section
      className={`community-service flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-bg ${
        expanded ? "min-h-0 flex-1" : "shrink-0"
      }`}
      aria-labelledby={labelId}
    >
      <div
        className={`flex min-w-0 items-center ${
          active ? "bg-field text-ink shadow-[inset_2px_0_0_var(--theme-accent)]" : ""
        }`}
      >
        <Link
          id={labelId}
          to={APP_PATHS.COMMUNITY}
          aria-current={location.pathname === APP_PATHS.COMMUNITY ? "page" : undefined}
          className={`flex h-10 min-w-0 flex-1 items-center truncate px-3 text-[11px] font-semibold tracking-[0.16em] uppercase ${
            active ? "text-ink" : "text-muted hover:text-ink"
          }`}
        >
          Jobs Community
        </Link>
        <button
          type="button"
          onClick={() => {
            setExpanded((open) => !open);
            if (!expanded) slot.activate?.();
          }}
          className="grid h-10 w-10 shrink-0 place-items-center text-muted hover:text-ink"
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-label={expanded ? "Collapse Jobs Community" : "Expand Jobs Community"}
        >
          <ChevronIcon className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div id={bodyId} className={`shell-history-body ${expanded ? "is-open" : ""}`} aria-hidden={!expanded} inert={!expanded || undefined}>
        <div className="shell-history-body-inner">
          <div className="shell-history-scroll h-full overflow-y-auto overflow-x-hidden px-1 pb-1.5">
            {slot.isLoading ? (
              <div className="space-y-2 px-1 py-2" aria-busy="true">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-9 rounded-lg bg-field motion-safe:animate-pulse" />
                ))}
              </div>
            ) : slot.error ? (
              <div className="px-2 py-4 text-center" role="alert">
                <p className="text-xs leading-5 text-muted">{slot.error}</p>
                <button type="button" onClick={() => slot.retry?.()} className="mt-3 h-8 rounded-lg bg-ink px-3 text-xs font-semibold text-white">
                  Retry
                </button>
              </div>
            ) : communities.length === 0 ? (
              <p className="px-2 py-5 text-center text-xs leading-5 text-muted">
                You have no communities yet. Open one from a saved job.
              </p>
            ) : (
              <ul className="flex flex-col">
                {communities.map((community) => {
                  const label = communityLabel(community);
                  const line = communityJobLine(community);
                  const selected = slot.currentCommunityId != null && String(slot.currentCommunityId) === String(community.id);
                  return (
                    <li key={String(community.id)} className="min-w-0">
                      <Link
                        to={APP_PATHS.communityRoom(community.id)}
                        aria-label={label}
                        aria-current={selected ? "page" : undefined}
                        className={`flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 ${
                          selected ? "bg-field text-ink" : "text-ink/80 hover:bg-field/80"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-white text-[10px] font-semibold text-ink"
                        >
                          {communityInitials(label)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px]">{label}</span>
                          {line && line !== label ? <span className="block truncate text-[11px] text-muted">{line}</span> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
