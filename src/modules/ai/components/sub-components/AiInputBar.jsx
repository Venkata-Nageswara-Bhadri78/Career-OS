import { useEffect, useId, useRef } from "react";
import { AI_LIMITS, getModeConfig } from "../../config/aiConfig";
import { MicIcon, SendIcon } from "../common/AiIcons";

export default function AiInputBar({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled,
  canSend,
  retryAfter,
  isOffline,
  resumeBlockedMessage,
  mode,
  onComingSoon,
}) {
  const textareaRef = useRef(null);
  const fieldId = useId();
  const length = value.length;
  const overLimit = length > AI_LIMITS.PROMPT_MAX;
  const modeConfig = getModeConfig(mode);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 168)}px`;
  }, [value]);

  useEffect(() => {
    const onKey = (event) => {
      const isMod = event.metaKey || event.ctrlKey;
      if (event.key === "/" && !event.altKey && !isMod) {
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        event.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = () => {
    if (!canSend || overLimit) return;
    onSend?.(value);
  };

  return (
    <div className="w-full bg-bg px-4 sm:px-8 md:px-12 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        {isOffline ? (
          <p className="mb-2 text-[11px] text-danger" role="status">
            You are offline. Reconnect before sending.
          </p>
        ) : null}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="relative flex items-end gap-2 rounded-2xl border border-line bg-field px-3 py-2 focus-within:border-ink"
        >
          <label htmlFor={fieldId} className="sr-only">
            Message Career Copilot
          </label>
          <textarea
            id={fieldId}
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            disabled={disabled}
            placeholder={modeConfig.placeholder}
            maxLength={AI_LIMITS.PROMPT_MAX + 50}
            className="flex-1 max-h-40 py-1.5 text-[15px] bg-transparent focus:outline-none placeholder:text-muted text-ink leading-relaxed"
          />
          <div className="flex items-center gap-1.5 shrink-0 self-end pb-0.5">
            <button
              type="button"
              onClick={onComingSoon}
              className="p-2 rounded-full text-muted hover:text-ink hover:bg-white"
              aria-label="Voice input"
            >
              <MicIcon />
            </button>
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="h-8 w-8 rounded-full bg-ink text-white grid place-items-center"
                aria-label="Stop generating"
              >
                <span className="h-2.5 w-2.5 bg-white rounded-[2px]" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend || overLimit}
                className="h-8 w-8 rounded-full bg-ink text-white grid place-items-center disabled:opacity-30"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            )}
          </div>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted px-1">
          <span>
            {retryAfter > 0
              ? `Rate limited · ${retryAfter}s`
              : resumeBlockedMessage
                ? resumeBlockedMessage
                : "This session is not saved. Saved-job history lives on a job’s Interact page."}
          </span>
          <span className={overLimit ? "text-danger font-semibold" : ""}>
            {length}/{AI_LIMITS.PROMPT_MAX}
          </span>
        </div>
      </div>
    </div>
  );
}
