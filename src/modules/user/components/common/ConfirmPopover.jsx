import { useEffect } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";

function clampPosition(top, left, width, height) {
  const pad = 8;
  const maxLeft = Math.max(pad, window.innerWidth - width - pad);
  const maxTop = Math.max(pad, window.innerHeight - height - pad);
  return {
    top: Math.min(Math.max(pad, top), maxTop),
    left: Math.min(Math.max(pad, left), maxLeft),
  };
}

export default function ConfirmPopover({
  open,
  anchor,
  title,
  message,
  confirmLabel = "Confirm",
  busy = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose, open]);

  if (!open || !anchor) return null;

  const width = 240;
  const height = 132;
  const placed = clampPosition(anchor.top, anchor.left, width, height);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default"
        aria-label="Close confirmation"
        onClick={() => !busy && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-confirm-popover-title"
        className="fixed z-50 w-60 rounded-xl border border-line bg-white p-3 shadow-xl"
        style={{ top: placed.top, left: placed.left }}
      >
        <h3 id="user-confirm-popover-title" className="text-xs font-semibold text-ink">
          {title}
        </h3>
        {message ? <p className="mt-1 text-[11px] leading-snug text-muted">{message}</p> : null}
        <div className="mt-3 flex justify-end gap-1.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-8 rounded-lg px-2.5 text-[11px] font-semibold text-muted hover:bg-field disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-danger px-2.5 text-[11px] font-semibold text-white disabled:opacity-50"
          >
            {busy ? <Spinner className="h-3 w-3 text-white" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
