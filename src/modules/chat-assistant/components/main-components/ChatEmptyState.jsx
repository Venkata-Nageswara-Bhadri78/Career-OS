import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import { STARTER_PROMPTS } from "../../config/chatAssistantConfig";

export default function ChatEmptyState({ hasJob, chatTitle, disabled, onUseTemplate }) {
  if (!hasJob) {
    return (
      <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
        <div className="h-14 w-14 rounded-2xl bg-ink text-white grid place-items-center shadow-sm">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h8M8 14h5M7 4h10a2 2 0 012 2v14l-4-2-3 2-3-2-4 2V6a2 2 0 012-2z" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-bold text-ink tracking-tight">Saved-job assistant</h2>
        <p className="mt-2 max-w-md text-sm text-muted leading-relaxed">
          This is a persistent conversation about one saved job, not general AI chat. Open a role from the
          dashboard or pick a thread in chat history.
        </p>
        <Link
          to={APP_PATHS.DASHBOARD}
          className="mt-6 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
        >
          Go to saved jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[46vh] flex flex-col items-center justify-center text-center px-6">
      <div className="h-12 w-12 rounded-2xl bg-field border border-line grid place-items-center text-ink shadow-xs">
        <span className="text-lg" aria-hidden="true">✦</span>
      </div>
      <h2 className="mt-4 text-xl font-bold text-ink tracking-tight">What can I help you with?</h2>
      <p className="mt-2 max-w-md text-sm text-muted leading-relaxed">
        Ask about {chatTitle ? <span className="font-semibold text-ink">{chatTitle}</span> : "this saved job"} —
        interview prep, skill fit, outreach, or compensation. A session starts only after you send a message.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
        {STARTER_PROMPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onUseTemplate?.(item.prompt)}
            className="px-3 py-1.5 rounded-xl border border-line bg-bg text-xs font-semibold text-ink hover:border-ink/40 hover:bg-field disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
