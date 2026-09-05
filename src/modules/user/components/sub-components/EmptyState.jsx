export default function EmptyState({ icon, message, actionLabel, onAction, disabled = false, compact = false }) {
  return (
    <div className={`flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-field/60 px-5 text-center ${compact ? "py-6" : "py-10"}`}>
      {icon ? <div className="mb-3 text-muted">{icon}</div> : null}
      <p className="max-w-md text-sm text-muted">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="mt-4 rounded-xl border border-ink px-4 py-2 text-xs font-semibold text-ink hover:bg-ink hover:text-white disabled:opacity-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
