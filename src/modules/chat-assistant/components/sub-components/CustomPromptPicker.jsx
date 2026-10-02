import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import useCustomPrompts from "../../hooks/useCustomPrompts";
import { ChatIconButton, CustomPromptsIcon } from "../common/ChatIcons";

export default function CustomPromptPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef(null);
  const { prompts, status, error, load } = useCustomPrompts({ autoLoad: false });

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <ChatIconButton
        label="Custom prompts"
        aria-expanded={open}
        aria-controls={menuId}
        className="h-8 gap-1.5 px-2 sm:w-auto w-8"
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (!current) load().catch(() => {});
            return next;
          });
        }}
      >
        <CustomPromptsIcon />
        <span className="hidden sm:inline text-xs font-semibold">Custom prompts</span>
      </ChatIconButton>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Custom prompts"
          className="absolute bottom-full left-0 mb-1 z-20 w-[min(20rem,calc(100vw-2.5rem))] rounded-xl border border-line bg-bg shadow-lg overflow-hidden"
        >
          <div className="chat-assistant-scroll max-h-72 overflow-y-auto p-1">
            {status === "loading" || status === "idle" ? (
              <p className="px-2.5 py-3 text-xs text-muted">Loading custom prompts…</p>
            ) : null}
            {status === "error" ? (
              <div className="px-2.5 py-3">
                <p className="text-xs text-danger" role="alert">
                  {error?.message || "Unable to load custom prompts."}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-ink underline"
                  onClick={() => load().catch(() => {})}
                >
                  Try again
                </button>
              </div>
            ) : null}
            {status === "ready" && prompts.length === 0 ? (
              <p className="px-2.5 py-3 text-xs text-muted">
                No saved prompts yet. Create one from Custom Prompts in the sidebar.
              </p>
            ) : null}
            {status === "ready"
              ? prompts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className="w-full rounded-lg px-2.5 py-2 text-left hover:bg-field"
                    onClick={() => {
                      onSelect?.(item.prompt);
                      setOpen(false);
                    }}
                  >
                    <span className="block text-xs font-semibold text-ink break-words">{item.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-muted break-words">
                      {item.prompt}
                    </span>
                  </button>
                ))
              : null}
          </div>
          <div className="border-t border-line px-2.5 py-2">
            <Link
              to={APP_PATHS.CUSTOM_PROMPTS}
              className="text-[11px] font-semibold text-ink hover:underline"
              onClick={() => setOpen(false)}
            >
              Manage custom prompts
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
