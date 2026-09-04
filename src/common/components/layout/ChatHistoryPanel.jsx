import { useEffect, useId, useRef, useState } from "react";
import { ChevronIcon, MoreIcon } from "./ShellIcons";
import { groupChatsByRecency } from "../../utils/chatHistory";
import Spinner from "../loaders/Spinner";

const TITLE_SCROLL_PX_PER_SEC = 42;
const TITLE_SCROLL_OVERLAY_PX = 28;

function ChatHistoryTitle({ text }) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const node = textRef.current;
    const row = wrap?.closest(".shell-chat-row");
    if (!wrap || !node || !row) return undefined;

    const cancel = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };

    const reset = () => {
      cancel();
      node.style.transform = "translateX(0px)";
    };

    const measureShift = () => {
      const overflow = node.scrollWidth - wrap.clientWidth + TITLE_SCROLL_OVERLAY_PX;
      return overflow > 4 ? overflow : 0;
    };

    const play = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        reset();
        return;
      }
      const shift = measureShift();
      if (shift <= 0) {
        reset();
        return;
      }
      cancel();
      const startedAt = performance.now();
      const duration = (shift / TITLE_SCROLL_PX_PER_SEC) * 1000;
      const tick = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        node.style.transform = `translateX(${-shift * progress}px)`;
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    };

    const onFocusOut = (event) => {
      if (!row.contains(event.relatedTarget)) reset();
    };

    row.addEventListener("mouseenter", play);
    row.addEventListener("mouseleave", reset);
    row.addEventListener("focusin", play);
    row.addEventListener("focusout", onFocusOut);

    return () => {
      row.removeEventListener("mouseenter", play);
      row.removeEventListener("mouseleave", reset);
      row.removeEventListener("focusin", play);
      row.removeEventListener("focusout", onFocusOut);
      reset();
    };
  }, [text]);

  return (
    <span ref={wrapRef} className="shell-chat-title">
      <span ref={textRef} className="shell-chat-title-text">
        {text}
      </span>
    </span>
  );
}

export default function ChatHistoryPanel({
  chats = [],
  isLoading = false,
  error = "",
  currentJobId = null,
  deletingId = null,
  expanded = true,
  onToggle,
  onSelect,
  onDelete,
  onRetry,
}) {
  const [menuJobId, setMenuJobId] = useState(null);
  const [confirmJobId, setConfirmJobId] = useState(null);
  const menuRef = useRef(null);
  const labelId = useId();
  const bodyId = useId();

  useEffect(() => {
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuJobId(null);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuJobId(null);
        setConfirmJobId(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const groups = groupChatsByRecency(chats);

  return (
    <section
      className={`flex flex-col rounded-xl border border-line bg-bg overflow-hidden ${
        expanded ? "flex-1 min-h-0" : "shrink-0"
      }`}
      aria-labelledby={labelId}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 h-10 shrink-0 text-left hover:bg-field/70 transition-colors"
        aria-expanded={expanded}
        aria-controls={bodyId}
        aria-label={expanded ? "Collapse chat history" : "Expand chat history"}
      >
        <span id={labelId} className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted">
          Chat history
        </span>
        <ChevronIcon
          className={`h-4 w-4 text-muted shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={bodyId}
        className={`shell-history-body ${expanded ? "is-open" : ""}`}
        aria-hidden={!expanded}
        inert={!expanded || undefined}
      >
        <div className="shell-history-body-inner">
          <div className="shell-history-scroll h-full overflow-y-auto px-1 pb-1.5">
            {isLoading ? (
              <div className="space-y-2 px-1 py-2" aria-busy="true" aria-live="polite">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-9 rounded-lg bg-field animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="px-2 py-4 text-center" role="alert">
                <p className="text-xs text-muted leading-5">{error}</p>
                {onRetry ? (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 h-8 px-3 rounded-lg bg-ink text-white text-xs font-semibold"
                  >
                    Try again
                  </button>
                ) : null}
              </div>
            ) : groups.length === 0 ? (
              <p className="px-2 py-5 text-xs text-muted text-center leading-5">
                No job chats yet. Open a saved job to start a conversation.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="mb-1.5">
                  <p className="px-2 pt-1.5 pb-1 text-[11px] font-semibold text-muted">{group.label}</p>
                  <ul className="flex flex-col">
                    {group.items.map((chat) => {
                      const active = currentJobId === chat.jobId;
                      const busy = deletingId === chat.jobId;
                      return (
                        <li key={chat.jobId} className="relative">
                          <div
                            className={`shell-chat-row group relative flex items-center rounded-lg transition-colors ${
                              active ? "bg-field text-ink" : "text-ink/80 hover:bg-field/80"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onSelect?.(chat.jobId)}
                              className="w-full min-w-0 text-left px-2 py-2 text-[13px]"
                              aria-current={active ? "page" : undefined}
                            >
                              <ChatHistoryTitle text={chat.title} />
                            </button>
                            <button
                              type="button"
                              className={`shell-chat-more absolute inset-y-0 right-0 z-10 w-7 grid place-items-center text-muted hover:text-ink ${
                                menuJobId === chat.jobId ? "is-open" : ""
                              }`}
                              aria-haspopup="menu"
                              aria-expanded={menuJobId === chat.jobId}
                              aria-label={`Chat actions for ${chat.title}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setConfirmJobId(null);
                                setMenuJobId((current) => (current === chat.jobId ? null : chat.jobId));
                              }}
                            >
                              <MoreIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {menuJobId === chat.jobId ? (
                            <div
                              ref={menuRef}
                              role="menu"
                              className="absolute right-1 top-full mt-0.5 z-20 w-[6.75rem] rounded-md border border-line bg-white shadow-md py-0.5"
                            >
                              {confirmJobId === chat.jobId ? (
                                <div className="px-1.5 py-1.5">
                                  <p className="text-[10px] text-muted leading-tight">Delete this chat?</p>
                                  <div className="mt-1.5 flex gap-1">
                                    <button
                                      type="button"
                                      className="flex-1 h-6 rounded text-[10px] font-semibold border border-line"
                                      onClick={() => setConfirmJobId(null)}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      className="flex-1 h-6 rounded text-[10px] font-semibold bg-danger text-white disabled:opacity-60"
                                      disabled={busy}
                                      onClick={() => onDelete?.(chat.jobId)}
                                    >
                                      {busy ? "…" : "Delete"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="w-full text-left px-2 py-1.5 text-[11px] text-danger hover:bg-red-50 disabled:opacity-60"
                                  disabled={busy}
                                  onClick={() => setConfirmJobId(chat.jobId)}
                                >
                                  {busy ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <Spinner className="h-2.5 w-2.5 text-danger" />
                                      Deleting
                                    </span>
                                  ) : (
                                    "Delete"
                                  )}
                                </button>
                              )}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
