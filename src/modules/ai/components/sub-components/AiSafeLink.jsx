import { hostnameFromHref, toSafeHref } from "../../utils/safeLinks";

export default function AiSafeLink({ href, children }) {
  const safe = toSafeHref(href);
  if (!safe) return <span>{children || href}</span>;
  const external = /^https?:/i.test(safe);
  return (
    <a
      href={safe}
      className="text-ink underline decoration-accent underline-offset-2 hover:text-accent"
      {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
      title={external ? hostnameFromHref(safe) : undefined}
    >
      {children || safe}
    </a>
  );
}
