import { useEffect, useId, useRef, useState } from "react";
import { STARTER_PROMPTS } from "../../config/chatAssistantConfig";
import { AttachIcon, ChatIconButton, TemplatesIcon, ToolsIcon } from "../common/ChatIcons";

export default function ChatInputBar({
  value,
  onChange,
  onSend,
  onStop,
  isSending,
  disabled,
  canSend,
  retryAfter,
  promptLimit,
  isOffline,
  onComingSoon,
}) {
  const textareaRef = useRef(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const templatesId = useId();
  const templatesRef = useRef(null);
  const length = value.length;
  const overLimit = length > promptLimit;

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

  useEffect(() => {
    if (!templatesOpen) return undefined;
    const onPointer = (event) => {
      if (!templatesRef.current?.contains(event.target)) setTemplatesOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [templatesOpen]);

  const submit = () => {
    if (!canSend) return;
    onSend?.(value);
  };

  return (
    <div className="w-full bg-bg/95 backdrop-blur-md px-4 sm:px-8 md:px-12 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        {isOffline ? (
          <p className="mb-2 text-[11px] text-danger" role="status">
            You are offline. Drafts stay in this browser until you reconnect.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-0.5 mb-2">
          <div className="relative" ref={templatesRef}>
            <ChatIconButton
              label="Prompt templates"
              aria-expanded={templatesOpen}
              aria-controls={templatesId}
              className="h-8 w-8"
              onClick={() => setTemplatesOpen((open) => !open)}
            >
              <TemplatesIcon />
            </ChatIconButton>
            {templatesOpen ? (
              <div
                id={templatesId}
                role="menu"
                className="absolute bottom-full mb-1 z-20 w-56 rounded-xl border border-line bg-bg shadow-lg p-1"
              >
                {STARTER_PROMPTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-field"
                    onClick={() => {
                      onChange?.(item.prompt);
                      setTemplatesOpen(false);
                      textareaRef.current?.focus();
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <ChatIconButton label="Attach a file" className="h-8 w-8" onClick={onComingSoon}>
            <AttachIcon />
          </ChatIconButton>
          <ChatIconButton label="Tools" className="h-8 w-8" onClick={onComingSoon}>
            <ToolsIcon />
          </ChatIconButton>
          <p className="ml-auto text-[10px] text-muted hidden sm:block">Enter to send · Shift+Enter for a new line · / focuses the composer</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="chat-assistant-composer relative flex items-end gap-2 rounded-2xl border border-line bg-field px-3 py-2"
        >
          <label htmlFor="chat-composer" className="sr-only">
            Message the saved-job assistant
          </label>
          <textarea
            id="chat-composer"
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
            placeholder={disabled && !isSending ? "Open a saved job to start chatting" : "Ask anything about this job…"}
            maxLength={promptLimit + 50}
            onPaste={(event) => {
              const files = event.clipboardData?.files;
              if (files && files.length > 0) {
                event.preventDefault();
                onComingSoon?.();
              }
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (event.dataTransfer?.files?.length) onComingSoon?.();
            }}
            className="flex-1 max-h-40 py-1.5 text-[15px] bg-transparent focus:outline-none placeholder:text-muted text-ink leading-relaxed"
          />
          <div className="flex items-center gap-1.5 shrink-0 self-end pb-0.5">
            <button
              type="button"
              onClick={onComingSoon}
              className="p-2 rounded-full text-muted hover:text-ink hover:bg-field"
              aria-label="Voice input"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            {isSending ? (
              <button
                type="button"
                onClick={onStop}
                className="h-8 w-8 rounded-full bg-ink text-white grid place-items-center"
                aria-label="Stop waiting for a reply"
                title="Stop waiting"
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
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted px-1">
          <span>
            {retryAfter > 0 ? `Rate limited · ${retryAfter}s` : "Replies use this job, your resume, and the latest 16 turns."}
          </span>
          <span className={overLimit ? "text-danger font-semibold" : ""}>
            {length}/{promptLimit}
          </span>
        </div>
      </div>
    </div>
  );
}
