import { useEffect, useId, useRef, useState } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";
import { JOB_EXTRACTION_LIMITS } from "../../config/jobExtractionConfig";

function resumeLabel(resume) {
  if (!resume) return "Select a resume";
  return `${resume.originalFilename || "Resume"}${resume.highPriority ? " (Priority)" : ""}`;
}

function ResumeSelect({ resumeId, resumes, knownResume, disabled, onResumeChange }) {
  const menuId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const selected = resumes.find((resume) => String(resume.id) === String(resumeId));
  const label = selected
    ? resumeLabel(selected)
    : resumes.length === 0
      ? "Priority resume"
      : !knownResume && resumeId
        ? "Selected resume"
        : "Select a resume";

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        id="job-resume"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-line bg-field px-3 text-left text-xs text-ink transition-colors hover:bg-bg focus:border-ink focus:bg-bg focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="min-w-0 truncate">{label}</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180 text-ink" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label="Resume"
          className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-xl"
        >
          {resumes.length === 0 ? (
            <div className="px-2.5 py-2 text-xs text-muted">No resumes available</div>
          ) : (
            resumes.map((resume) => {
              const isSelected = String(resume.id) === String(resumeId);
              return (
                <button
                  key={resume.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onResumeChange?.(resume.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                    isSelected ? "bg-field font-semibold text-ink" : "font-medium text-ink/80 hover:bg-field/80 hover:text-ink"
                  }`}
                >
                  <span className="min-w-0 truncate">{resume.originalFilename || "Resume"}</span>
                  {resume.highPriority ? (
                    <span className="shrink-0 rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                      Priority
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

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
  mode = "manual",
  isAuto = false,
  sourceUrl,
  rawJobText,
  resumeId,
  resumes = [],
  resumesError = null,
  onModeChange,
  onSourceUrlChange,
  onRawJobTextChange,
  onResumeChange,
  onAutoChange,
  onExtract,
  isLoading = false,
  isLocked = false,
  errors = {},
  retryAfter = null,
}) {
  const automated = mode === "automated";
  const canSubmit =
    sourceUrl.trim().length > 0 &&
    (automated || rawJobText.trim().length > 0) &&
    !isLoading &&
    !isLocked &&
    !retryAfter;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onExtract();
  };

  const hasStatusMessage = Boolean(errors.general || errors.resume || resumesError || retryAfter || (isLocked && !isLoading));
  const knownResume = resumes.some((resume) => String(resume.id) === String(resumeId));

  return (
    <form onSubmit={handleSubmit} className="job-extraction-extract-panel flex-1 min-h-0">
      <div className="shrink-0" role="tablist" aria-label="Extraction method">
        <div className="flex gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "manual"}
            disabled={isLoading || isLocked}
            onClick={() => onModeChange?.("manual")}
            className={`inline-flex items-center gap-1.5 border-b-2 px-2 py-2 text-xs font-semibold ${
              mode === "manual" ? "border-accent text-ink" : "border-transparent text-muted"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 5l-2 2m0 0l-6 6-2 5 5-2 6-6m-1-5l2-2 2 2-2 2" />
            </svg>
            Manual Extraction
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={automated}
            disabled={isLoading || isLocked}
            onClick={() => onModeChange?.("automated")}
            className={`inline-flex items-center gap-1.5 border-b-2 px-2 py-2 text-xs font-semibold ${
              automated ? "border-accent text-ink" : "border-transparent text-muted"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10 5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 11a5 5 0 00-7.07 0L5.5 12.41a5 5 0 007.07 7.07L14 19" />
            </svg>
            Automated Extraction
          </button>
        </div>
      </div>

      <div className="job-extraction-extract-body pt-3 gap-2.5">
        {hasStatusMessage && (
          <div className="shrink-0 space-y-2">
            {errors.general && <InlineAlert>{errors.general}</InlineAlert>}
            {errors.resume && <InlineAlert>{errors.resume}</InlineAlert>}
            {resumesError && <InlineAlert tone="muted">{resumesError}</InlineAlert>}
            {retryAfter ? (
              <InlineAlert tone="muted">Too many requests. Try again in {retryAfter}s.</InlineAlert>
            ) : null}
            {isLocked && !isLoading && (
              <InlineAlert tone="success">Extracted — review fields on the right.</InlineAlert>
            )}
          </div>
        )}

        <div className={`job-extraction-extract-fields gap-2.5 ${automated ? "" : ""}`}>
          <div className="shrink-0 space-y-1">
            <label htmlFor="job-resume" className="block text-xs font-medium text-ink">
              Resume
            </label>
            <ResumeSelect
              resumeId={resumeId}
              resumes={resumes}
              knownResume={knownResume}
              disabled={isLoading || isLocked || resumes.length === 0}
              onResumeChange={onResumeChange}
            />
          </div>

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

          {automated ? (
            <p className="shrink-0 text-[11px] leading-snug text-muted">
              The posting is fetched from this URL. You do not paste the description.
            </p>
          ) : (
            <div className="flex flex-col flex-1 min-h-0 gap-1">
              <div className="shrink-0 flex items-center justify-between gap-2">
                <label htmlFor="job-raw-text" className="block text-xs font-medium text-ink">
                  Job Description <span className="text-danger">*</span>
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
                placeholder="Paste the full job posting content here..."
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
          )}
        </div>
      </div>

      <div className="shrink-0 space-y-2.5 border-t border-line pt-2.5 mt-auto">
        <label className="flex items-start gap-2 text-xs text-ink">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={isAuto}
            disabled={isLoading || isLocked}
            onChange={(event) => onAutoChange?.(event.target.checked)}
          />
          <span>
            <span className="font-medium">Save automatically</span>
            <span className="mt-0.5 block text-[11px] text-muted">
              {isAuto
                ? "On: create the job or a draft without a preview."
                : "Off: review the extracted fields before saving."}
            </span>
          </span>
        </label>
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
          ) : isAuto ? (
            "Extract & Continue →"
          ) : (
            "Extract Job Info"
          )}
        </button>
      </div>
    </form>
  );
}
