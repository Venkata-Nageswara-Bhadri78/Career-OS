import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";

export default function AiErrorBanner({ error, onRetry, onDismiss }) {
  if (!error?.message) return null;

  return (
    <div className="mx-4 sm:mx-8 md:mx-12 mb-3 rounded-2xl border border-danger/30 bg-red-50 px-4 py-3 text-xs text-danger" role="alert">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold">Notice</p>
          <p className="text-ink/80">{error.message}</p>
          {error.profileLink ? (
            <Link to={APP_PATHS.PROFILE} className="inline-flex text-ink font-semibold underline decoration-accent underline-offset-2">
              Open profile
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {error.canRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="h-8 px-3 rounded-xl bg-ink text-white text-[11px] font-semibold"
            >
              Retry
            </button>
          ) : null}
          {onDismiss ? (
            <button type="button" onClick={onDismiss} className="h-8 px-3 rounded-xl border border-line bg-white text-[11px] font-semibold text-ink">
              Dismiss
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
