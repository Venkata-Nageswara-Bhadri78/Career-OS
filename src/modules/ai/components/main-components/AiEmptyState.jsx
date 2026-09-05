import { getSuggestionsForMode } from "../../config/aiConfig";
import { SparkIcon } from "../common/AiIcons";

export default function AiEmptyState({ mode, jobLabel, disabled, onUseTemplate }) {
  const suggestions = getSuggestionsForMode(mode);

  return (
    <div className="h-full min-h-[46vh] flex flex-col items-center justify-center text-center px-6">
      <div className="h-12 w-12 rounded-2xl bg-ink text-white grid place-items-center shadow-sm">
        <SparkIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-ink tracking-tight">Career Copilot</h2>
      <p className="mt-2 max-w-md text-sm text-muted leading-relaxed">
        One-shot answers with optional resume and job grounding
        {jobLabel ? (
          <>
            {" "}
            for <span className="font-semibold text-ink">{jobLabel}</span>
          </>
        ) : null}
        . Threads are not stored here.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onUseTemplate?.(item.prompt)}
            className="px-3 py-1.5 rounded-xl border border-line bg-bg text-xs font-semibold text-ink hover:bg-field disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
