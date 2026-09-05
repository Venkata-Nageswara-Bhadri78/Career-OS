import { useEffect } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";

export default function InlineEditor({
  title,
  onSubmit,
  onCancel,
  busy = false,
  error = "",
  saveLabel = "Save",
  fill = false,
  children,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onCancel]);

  return (
    <form
      onSubmit={onSubmit}
      className={`flex flex-col gap-2.5 rounded-lg border border-line bg-field/50 p-3${fill ? " h-full min-h-0" : ""}`}
    >
      {title ? <p className="shrink-0 text-xs font-semibold text-ink">{title}</p> : null}
      {error ? (
        <p className="shrink-0 rounded-lg border border-danger/20 bg-danger/5 px-2.5 py-1.5 text-[11px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className={fill ? "flex min-h-0 flex-1 flex-col" : undefined}>{children}</div>
      <div className="flex shrink-0 justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="h-9 rounded-lg px-3 text-xs font-medium text-muted hover:bg-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-semibold text-white disabled:opacity-50"
        >
          {busy ? <Spinner className="h-3.5 w-3.5 text-white" /> : null}
          {saveLabel}
        </button>
      </div>
    </form>
  );
}
