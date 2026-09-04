import { useEffect } from "react";

export default function ChatConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  busy = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-confirm-title"
        className="relative w-full max-w-sm rounded-2xl border border-line bg-bg p-5 shadow-2xl"
      >
        <h2 id="chat-confirm-title" className="text-sm font-bold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-9 px-3 rounded-xl border border-line text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-9 px-4 rounded-xl bg-danger text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
