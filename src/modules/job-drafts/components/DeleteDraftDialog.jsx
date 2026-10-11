import { useEffect, useId } from "react";
import Spinner from "../../../common/components/loaders/Spinner";

export default function DeleteDraftDialog({ isOpen, busy = false, onConfirm, onClose }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-2xl"
      >
        <h3 id={titleId} className="text-base font-semibold text-ink">
          Delete draft
        </h3>
        <p className="mt-1 text-xs text-muted">This removes the unfinished job. It does not delete a saved job.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg px-3 py-2 text-xs font-medium text-muted hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {busy ? <Spinner className="h-3.5 w-3.5 text-white" /> : null}
            Delete draft
          </button>
        </div>
      </div>
    </div>
  );
}
