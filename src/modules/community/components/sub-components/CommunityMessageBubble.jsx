import { formatCommunityClock } from "../../utils/communityTime";

export default function CommunityMessageBubble({ message, own, grouped }) {
  const displayName = own ? "You" : message?.sender?.displayName || message?.sender?.username || "Member";
  const clock = formatCommunityClock(message?.createdAt);
  const content = typeof message?.content === "string" ? message.content : "";

  return (
    <article
      className={`flex w-full min-w-0 ${own ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-3"}`}
      aria-label={own ? `Your message${clock ? `, ${clock}` : ""}` : undefined}
    >
      <div className={`flex min-w-0 max-w-[85%] flex-col ${own ? "items-end" : "items-start"}`}>
        {grouped ? null : (
          <p className={`px-1 text-xs font-semibold text-ink ${own ? "text-right" : "text-left"}`}>
            {displayName}
          </p>
        )}
        <div
          className={`min-w-0 max-w-full rounded-2xl px-3 py-2 text-sm leading-6 text-ink ${
            own
              ? "rounded-tr-sm bg-[color-mix(in_srgb,var(--theme-accent)_28%,white)]"
              : "rounded-tl-sm border border-line bg-white"
          } ${grouped ? "" : "mt-1"}`}
        >
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{content}</p>
        </div>
        {clock ? <p className="mt-1 px-1 text-[11px] text-muted">{clock}</p> : null}
      </div>
    </article>
  );
}
