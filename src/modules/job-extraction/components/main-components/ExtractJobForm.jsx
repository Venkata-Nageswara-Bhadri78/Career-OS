import Spinner from "../../../../common/components/loaders/Spinner";
import { JOB_EXTRACTION_LIMITS } from "../../config/jobExtractionConfig";

function InlineAlert({ children, tone = "danger" }) {
  const tones = {
    danger: "bg-danger/5 border-danger/20 text-danger",
    muted: "bg-field border-line text-muted",
    success: "bg-success/5 border-success/20 text-success",
  };

  return (
    <div
      className={`px-2.5 py-2 rounded-lg border text-[11px] leading-snug flex items-start gap-1.5 ${tones[tone]}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span className="font-bold shrink-0">{tone === "success" ? "✓" : "!"}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

export default function ExtractJobForm({
  sourceUrl,
  rawJobText,
  onSourceUrlChange,
  onRawJobTextChange,
  onExtract,
  isLoading = false,
  isLocked = false,
  errors = {},
  retryAfter = null,
}) {
  const canSubmit =
    sourceUrl.trim().length > 0 &&
    rawJobText.trim().length > 0 &&
    !isLoading &&
    !isLocked &&
    !retryAfter;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onExtract();
  };

  const hasStatusMessage = Boolean(errors.general || retryAfter || (isLocked && !isLoading));

  return (
    <form onSubmit={handleSubmit} className="job-extraction-extract-panel flex-1 min-h-0">
      <div className="shrink-0 border-b pb-2 border-line">
        <h2 className="text-base font-bold text-ink">Extract Job Info</h2>
        <p className="text-[11px] text-muted mt-0.5 leading-snug">
          Paste the job URL and page text. AI will pre-fill the review form.
        </p>
      </div>

      <div className="job-extraction-extract-body pt-3 gap-2.5">
        {hasStatusMessage && (
          <div className="shrink-0 space-y-2">
            {errors.general && <InlineAlert>{errors.general}</InlineAlert>}
            {retryAfter ? (
              <InlineAlert tone="muted">Too many requests. Try again in {retryAfter}s.</InlineAlert>
            ) : null}
            {isLocked && !isLoading && (
              <InlineAlert tone="success">Extracted — review fields on the right.</InlineAlert>
            )}
          </div>
        )}

        <div className="job-extraction-extract-fields gap-2.5">
          <div className="shrink-0 space-y-1">
            <label htmlFor="job-source-url" className="block text-xs font-medium text-ink">
              Job Posting URL <span className="text-danger">*</span>
            </label>
            <input
              id="job-source-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              value={sourceUrl}
              onChange={(e) => onSourceUrlChange(e.target.value.slice(0, JOB_EXTRACTION_LIMITS.SOURCE_URL_MAX))}
              placeholder="https://www.linkedin.com/jobs/view/123456789"
              disabled={isLoading || isLocked}
              aria-invalid={Boolean(errors.url)}
              aria-describedby={errors.url ? "job-source-url-error" : undefined}
              className={`w-full px-3 py-2 text-xs rounded-lg bg-field border focus:bg-bg focus:border-ink focus:outline-none transition-all placeholder:text-muted/70 text-ink disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.url ? "border-danger/40" : "border-line"
              }`}
            />
            {errors.url && (
              <p id="job-source-url-error" className="text-[11px] text-danger font-medium">
                {errors.url}
              </p>
            )}
          </div>

          <div className="flex flex-col flex-1 min-h-0 gap-1">
            <div className="shrink-0 flex items-center justify-between gap-2">
              <label htmlFor="job-raw-text" className="block text-xs font-medium text-ink">
                Pasted Job Description <span className="text-danger">*</span>
              </label>
              <span className="text-[10px] text-muted shrink-0">
                {rawJobText.length.toLocaleString()}/{JOB_EXTRACTION_LIMITS.RAW_JOB_TEXT_MAX.toLocaleString()}
              </span>
            </div>
            <textarea
              id="job-raw-text"
              value={rawJobText}
              onChange={(e) =>
                onRawJobTextChange(e.target.value.slice(0, JOB_EXTRACTION_LIMITS.RAW_JOB_TEXT_MAX))
              }
              placeholder="Paste the full job posting content here…"
              disabled={isLoading || isLocked}
              aria-invalid={Boolean(errors.text)}
              aria-describedby={errors.text ? "job-raw-text-error" : undefined}
              className={`job-extraction-field-fill w-full p-2.5 text-xs rounded-lg bg-field border focus:bg-bg focus:border-ink focus:outline-none transition-all placeholder:text-muted/70 text-ink leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.text ? "border-danger/40" : "border-line"
              }`}
            />
            {errors.text && (
              <p id="job-raw-text-error" className="shrink-0 text-[11px] text-danger font-medium">
                {errors.text}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 pt-2.5 mt-auto border-t border-line">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-ink text-bg hover:opacity-90 active:scale-[0.99] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Spinner className="h-3.5 w-3.5 text-bg" />
              <span>Extracting…</span>
            </>
          ) : isLocked ? (
            "Extracted ✓"
          ) : (
            "Extract Job Info"
          )}
        </button>
      </div>
    </form>
  );
}
