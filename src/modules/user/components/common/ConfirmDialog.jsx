import { useEffect } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  busy = false,
  error = "",
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && open && !busy) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose, open]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-danger text-white hover:opacity-90"
      : "bg-ink text-white hover:opacity-90";

  return (
    <div className="user-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close dialog" onClick={() => !busy && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-confirm-title"
        className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-2xl"
      >
        <h3 id="user-confirm-title" className="text-base font-semibold text-ink">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        {error ? (
          <p className="mt-3 rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink hover:bg-field disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-50 ${confirmClass}`}
          >
            {busy ? <Spinner className="h-3.5 w-3.5 text-white" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
