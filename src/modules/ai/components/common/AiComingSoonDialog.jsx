import { useEffect } from "react";
import { COMING_SOON_MESSAGE } from "../../config/aiConfig";

export default function AiComingSoonDialog({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ai-coming-soon-title"
        className="relative w-full max-w-sm rounded-2xl border border-line bg-bg p-5 shadow-2xl"
      >
        <h2 id="ai-coming-soon-title" className="text-sm font-bold text-ink">
          Coming soon
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">{COMING_SOON_MESSAGE}</p>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-ink text-white text-sm font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
