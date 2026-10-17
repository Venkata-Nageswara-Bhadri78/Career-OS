import { useEffect, useId, useRef } from "react";
import { COMMUNITY_LIMITS } from "../../config/communityConstants";
import { countCommunityCodePoints, validateCommunityMessage } from "../../utils/communityMessageText";

const SEND_UNAVAILABLE = "Live sending is not connected yet.";

export default function CommunityComposer({
  value,
  onChange,
  canSend = false,
  onSubmit,
  disabled = false,
  notice = "",
  sending = false,
}) {
  const fieldId = useId();
  const hintId = useId();
  const textareaRef = useRef(null);
  const text = typeof value === "string" ? value : "";
  const validation = validateCommunityMessage(text);
  const codePoints = countCommunityCodePoints(text);
  const max = COMMUNITY_LIMITS.MESSAGE_MAX_CODE_POINTS;
  const overLimit = countCommunityCodePoints(text.trim()) > max;
  const showReason = Boolean(text) && !validation.ok;
  const sendReady = canSend && validation.ok && !disabled;

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 168)}px`;
  }, [text]);

  const trySubmit = () => {
    if (!canSend) return;
    if (!validation.ok) return;
    onSubmit?.(validation.text);
  };

  return (
    <div data-community-composer className="shrink-0 border-t border-line bg-white px-3 py-3 sm:px-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          trySubmit();
        }}
        className="flex items-end gap-2"
      >
        <div className="min-w-0 flex-1">
          <label htmlFor={fieldId} className="sr-only">
            Message
          </label>
          <textarea
            id={fieldId}
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(event) => onChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                trySubmit();
              }
            }}
            disabled={disabled}
            placeholder="Type a message"
            aria-describedby={hintId}
            className="max-h-40 min-h-10 w-full resize-none rounded-2xl border border-line bg-field px-3 py-2 text-sm leading-6 text-ink placeholder:text-muted focus:border-ink focus:outline-none disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={!sendReady}
          aria-describedby={hintId}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
      <div id={hintId} className="mt-1.5 flex items-start justify-between gap-3 px-1 text-[11px] leading-5 text-muted">
        <p>
          {sending
            ? "Sending…"
            : notice
              ? notice
              : showReason
                ? validation.reason
                : canSend
                  ? `Messages can be up to ${max} characters.`
                  : `${disabled ? "Disconnected. Messages cannot be sent until the connection returns." : SEND_UNAVAILABLE} Messages can be up to ${max} characters.`}
        </p>
        <p className={overLimit ? "shrink-0 font-semibold text-danger" : "shrink-0"}>
          {codePoints}/{max}
        </p>
      </div>
    </div>
  );
}
