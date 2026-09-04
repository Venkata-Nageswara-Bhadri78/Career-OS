import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";

export default function ChatErrorBanner({ error, retryAfter, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6" role="alert">
      <div className="mb-3 rounded-xl border border-danger/20 bg-danger/5 px-3.5 py-2.5 text-sm text-danger flex flex-col sm:flex-row sm:items-center gap-2">
        <p className="flex-1 leading-relaxed">
          {error.message}
          {error.kind === "rateLimit" && retryAfter > 0 ? ` Try again in ${retryAfter}s.` : null}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {error.profileLink ? (
            <Link to={APP_PATHS.PROFILE} className="h-8 px-3 rounded-lg bg-ink text-white text-xs font-semibold grid place-items-center">
              Open profile
            </Link>
          ) : null}
          {error.canRetry && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              disabled={error.kind === "rateLimit" && retryAfter > 0}
              className="h-8 px-3 rounded-lg border border-danger/20 text-xs font-semibold disabled:opacity-50"
            >
              Retry
            </button>
          ) : null}
          {onDismiss ? (
            <button type="button" onClick={onDismiss} className="h-8 px-2 text-xs font-semibold text-muted">
              Dismiss
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
