import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function focusable(container) {
  if (!container) return [];
  return [...container.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter(
    (node) => !node.disabled
  );
}

export default function CommunityLeaveDialog({ open, creator, busy, error, onConfirm, onClose }) {
  const dialogRef = useRef(null);
  const restoreRef = useRef(null);
  const busyRef = useRef(busy);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;
    const dialog = dialogRef.current;
    const items = focusable(dialog);
    items[0]?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusable(dialog);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreRef.current?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-leave-title"
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-2xl"
      >
        <h2 id="community-leave-title" className="text-base font-semibold text-ink">
          Leave community
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink">
          You will stop seeing this room. The community, its messages, and the other members stay.
        </p>
        {creator ? <p className="mt-2 text-sm leading-6 text-ink">The group stays open for other people.</p> : null}
        {error ? (
          <p className="mt-3 text-sm leading-6 text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold text-ink disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-danger px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Leaving…" : "Leave"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
