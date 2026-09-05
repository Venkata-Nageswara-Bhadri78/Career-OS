import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import { AI_LIMITS } from "../../config/aiConfig";
import { ChevronIcon } from "../common/AiIcons";

function statusCopy(resume) {
  switch (resume.status) {
    case "ready":
      return { label: "Resume grounded", detail: "The high-priority parsed resume will be used unless you paste a replacement." };
    case "missing":
      return { label: "No stored resume", detail: "Chat still works. Paste resume text or upload a PDF from Profile to ground answers." };
    case "pending":
      return { label: "Resume parsing", detail: resume.message || "Your resume is still being processed. Wait, or paste resume text to continue." };
    case "failed":
      return { label: "Resume unusable", detail: resume.message || "Re-upload a PDF from Profile, or paste resume text to continue." };
    case "rateLimited":
      return { label: "Resume preview paused", detail: "Resume-context lookups are rate limited. Chat can still send if parsing is already done." };
    case "error":
      return { label: "Resume status unavailable", detail: resume.message || "Could not check resume context." };
    default:
      return { label: "Checking resume", detail: "Looking up high-priority resume context." };
  }
}

export default function AiGroundingPanel({ grounding, disabled }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const resumeId = useId();
  const jobId = useId();
  const tempId = useId();
  const resume = statusCopy(grounding.resume);
  const selectedJob = grounding.selectedJob;

  return (
    <section className="px-4 sm:px-8 md:px-12">
      <div className="rounded-2xl border border-line bg-white">
        <button
          type="button"
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink truncate">
              {resume.label}
              {grounding.usingCustomResume ? " · pasted resume" : ""}
              {grounding.usingPastedJob ? " · pasted job" : selectedJob ? ` · ${selectedJob.label}` : ""}
            </p>
            <p className="text-[11px] text-muted truncate">{resume.detail}</p>
          </div>
          <ChevronIcon className={`h-4 w-4 text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open ? (
          <div id={panelId} className="px-4 pb-4 space-y-4 border-t border-line">
            <div className="pt-3 flex flex-wrap items-center gap-2 text-[11px]">
              {grounding.resume.status === "failed" || grounding.resume.status === "missing" ? (
                <Link to={APP_PATHS.PROFILE} className="h-8 inline-flex items-center px-3 rounded-xl bg-ink text-white font-semibold">
                  Open profile
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => grounding.refreshResume()}
                className="h-8 px-3 rounded-xl border border-line font-semibold text-ink"
              >
                Refresh resume status
              </button>
            </div>

            <div>
              <label htmlFor={resumeId} className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                Paste resume text (optional, overrides stored resume)
              </label>
              <textarea
                id={resumeId}
                value={grounding.customResumeText}
                onChange={(event) => grounding.setCustomResumeText(event.target.value)}
                disabled={disabled}
                rows={4}
                maxLength={AI_LIMITS.PASTE_MAX + 20}
                className="w-full rounded-xl border border-line bg-field px-3 py-2 text-sm text-ink"
                placeholder="Paste resume text if you do not want to wait for parsing, or have no stored PDF."
              />
              <p className={`mt-1 text-[11px] ${grounding.resumePasteError ? "text-danger" : "text-muted"}`}>
                {grounding.customResumeText.length}/{AI_LIMITS.PASTE_MAX}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="ai-saved-job" className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Saved job (optional)
                </label>
                <select
                  id="ai-saved-job"
                  value={grounding.jobId || ""}
                  disabled={disabled || grounding.usingPastedJob || grounding.isLoadingJobs}
                  onChange={(event) => grounding.selectJobId(event.target.value)}
                  className="w-full h-10 rounded-xl border border-line bg-field px-3 text-sm text-ink disabled:opacity-60"
                >
                  <option value="">No saved job</option>
                  {grounding.jobId && !grounding.jobs.some((job) => job.id === grounding.jobId) ? (
                    <option value={grounding.jobId}>Saved job #{grounding.jobId}</option>
                  ) : null}
                  {grounding.jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.label}
                    </option>
                  ))}
                </select>
                {grounding.jobsError ? <p className="mt-1 text-[11px] text-muted">{grounding.jobsError}</p> : null}
                {grounding.jobId ? (
                  <Link
                    to={APP_PATHS.jobChat(grounding.jobId)}
                    className="mt-2 inline-flex text-[11px] font-semibold text-ink underline decoration-accent underline-offset-2"
                  >
                    Open saved-job chat history
                  </Link>
                ) : null}
              </div>

              <div>
                <label htmlFor={tempId} className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Temperature (optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={tempId}
                    type="range"
                    min={AI_LIMITS.TEMPERATURE_MIN}
                    max={AI_LIMITS.TEMPERATURE_MAX}
                    step="0.1"
                    value={grounding.temperature ?? 0.7}
                    disabled={disabled}
                    onChange={(event) => grounding.setTemperature(Number(event.target.value))}
                    className="flex-1 accent-[var(--theme-accent)]"
                  />
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-ink underline"
                    onClick={() => grounding.setTemperature(null)}
                  >
                    Default
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {grounding.temperature == null ? "Server default (~0.7)" : grounding.temperature.toFixed(1)}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor={jobId} className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                Paste job description (optional, overrides saved job)
              </label>
              <textarea
                id={jobId}
                value={grounding.jobDescription}
                onChange={(event) => grounding.setJobDescription(event.target.value)}
                disabled={disabled}
                rows={4}
                maxLength={AI_LIMITS.PASTE_MAX + 20}
                className="w-full rounded-xl border border-line bg-field px-3 py-2 text-sm text-ink"
                placeholder="Paste a job description to ground this session without using a saved job."
              />
              <p className={`mt-1 text-[11px] ${grounding.jobPasteError ? "text-danger" : "text-muted"}`}>
                {grounding.jobDescription.length}/{AI_LIMITS.PASTE_MAX}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
