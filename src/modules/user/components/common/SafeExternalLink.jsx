import { hostnameFromHref, toSafeHref } from "../../utils/formatters";
import { IconExternal } from "./UserIcons";

export default function SafeExternalLink({ href, children, className = "", showIcon = true }) {
  const safe = toSafeHref(href);
  if (!safe) {
    return <span className={className}>{children || "—"}</span>;
  }

  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`inline-flex min-w-0 items-center gap-1.5 text-ink hover:text-accent underline decoration-accent/70 underline-offset-2 ${className}`}
      title={hostnameFromHref(safe)}
    >
      <span className="truncate">{children || hostnameFromHref(safe) || safe}</span>
      {showIcon ? <IconExternal className="h-3.5 w-3.5 shrink-0" /> : null}
    </a>
  );
}
