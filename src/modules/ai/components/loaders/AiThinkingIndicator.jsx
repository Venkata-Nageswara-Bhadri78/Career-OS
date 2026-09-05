import AiSpinner from "./AiSpinner";

export default function AiThinkingIndicator({ label = "Career Copilot" }) {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <div className="h-7 w-7 rounded-xl bg-ink text-white grid place-items-center text-[10px] font-bold shrink-0">
        AI
      </div>
      <div className="rounded-2xl px-4 py-3 bg-white border border-line flex items-center gap-3 text-xs text-muted">
        <AiSpinner className="h-3.5 w-3.5 text-ink" />
        <span className="font-medium text-ink">Writing a {label.toLowerCase()} reply…</span>
      </div>
    </div>
  );
}
