import { useState, useEffect, useRef } from "react";
import InlineEditableCell from "./InlineEditableCell";
import { JobSkillsField } from "../common/JobSkillsField";
import { formatDate, copyToClipboard, isSafeHttpUrl, splitJobSkills } from "../../utils/formatters";
import { mergeJobSummary } from "../../mappers/jobMapper";
import jobApi from "../../api/jobApi";
import JobStatusField from "../common/JobStatusField";
import ResumeMatchScore from "../common/ResumeMatchScore";
import Spinner from "../../../../common/components/loaders/Spinner";
import {
  JOBS_EMPLOYMENT_TYPE_PRESETS,
  JOBS_WORK_MODE_PRESETS,
} from "../../config/jobsConfig";
import "../../styles/jobs.css";

export default function JobDetailsDrawer({
  isOpen,
  jobId = null,
  job: initialJob = null,
  onClose,
  onJobUpdated,
  variant = "drawer",
}) {
  const isPage = variant === "page";
  const [job, setJob] = useState(initialJob || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Sync initialJob prop if passed
  useEffect(() => {
    if (initialJob) {
      setJob(initialJob);
    }
  }, [initialJob]);

  // Fetch job by ID if only jobId is provided or when opened with jobId
  useEffect(() => {
    let ignore = false;
    const targetId = jobId || initialJob?.id;

    if (isOpen && targetId && !initialJob) {
      async function load() {
        try {
          setIsLoading(true);
          setError(null);
          const data = await jobApi.getJobById(targetId);
          if (!ignore) setJob(data);
        } catch (err) {
          if (!ignore) setError(err.message || "Failed to load job details.");
        } finally {
          if (!ignore) setIsLoading(false);
        }
      }
      load();
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, jobId, initialJob]);

  // Escape key handler
  useEffect(() => {
    if (isPage) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPage, onClose]);

  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen || isPage) return undefined;
    const html = document.documentElement;
    const { overflow: prevHtmlOverflow, overscrollBehavior: prevHtmlOverscroll } = html.style;
    const { overflow: prevBodyOverflow, overscrollBehavior: prevBodyOverscroll } = document.body.style;
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const stopChainedScroll = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      event.preventDefault();
    };
    document.addEventListener("wheel", stopChainedScroll, { passive: false });
    document.addEventListener("touchmove", stopChainedScroll, { passive: false });

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
      document.removeEventListener("wheel", stopChainedScroll);
      document.removeEventListener("touchmove", stopChainedScroll);
    };
  }, [isOpen, isPage]);

  const handleFieldUpdate = async (fieldUpdater, val, fieldKey) => {
    if (!job) return;
    try {
      const updated = await fieldUpdater(job.id, val);
      const patch = { ...updated };
      if (fieldKey === "jobStatus" && val && typeof val === "object") {
        patch.jobStatus = updated?.jobStatus ?? val.jobStatus;
        if (Object.prototype.hasOwnProperty.call(val, "customStatus") || updated?.jobStatus !== "CUSTOM") {
          patch.customStatus = updated?.customStatus ?? null;
        }
      } else if (updated?.[fieldKey] == null && val != null && typeof val !== "object") {
        patch[fieldKey] = val;
      }
      const merged = mergeJobSummary(job, patch);
      if (fieldKey && fieldKey !== "jobStatus" && typeof val !== "object") {
        merged[fieldKey] = patch[fieldKey] != null ? patch[fieldKey] : val;
      }
      setJob(merged);
      if (onJobUpdated) onJobUpdated(merged);
    } catch (err) {
      setError(err?.message || `Failed to update ${fieldKey}.`);
      throw err;
    }
  };

  const handleCopyDescription = async () => {
    const text = job?.description || job?.originalDescription || `${job?.title} at ${job?.company}`;
    await copyToClipboard(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  const detailsBody = (
    <>
          <div className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain hide-scrollbar ${isPage ? "p-4 sm:p-6" : ""}`}>
            {/* Header */}
            <div className={`${isPage ? "flex flex-col gap-2" : "flex items-start gap-3"} pb-4 border-b border-zinc-100 min-w-0`}>
              {isPage ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex w-fit shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-semibold text-ink hover:bg-field"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : null}
              <div className={isPage ? "flex min-w-0 items-start gap-3" : "contents"}>
              <div className="min-w-0 pr-3 flex-1">
                {(job?.createdAt || job?.updatedAt) && (
                  <div className="text-[11px] font-medium text-zinc-400 mb-1">
                    {job.createdAt ? `Created ${formatDate(job.createdAt)}` : null}
                    {job.createdAt && job.updatedAt ? " · " : null}
                    {job.updatedAt ? `Updated ${formatDate(job.updatedAt)}` : null}
                  </div>
                )}
                {job ? (
                  <div className="space-y-1">
                    <InlineEditableCell
                      value={job.title}
                      onSave={(val) => handleFieldUpdate(jobApi.updateTitle, val, "title")}
                      placeholder="Job Title"
                      fieldLabel="Job Title"
                      textClassName="text-xl font-bold text-zinc-900 break-words"
                    />
                    <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-600 font-medium">
                      <InlineEditableCell
                        value={job.company}
                        onSave={(val) => handleFieldUpdate(jobApi.updateCompany, val, "company")}
                        placeholder="Company Name"
                        fieldLabel="Company"
                        textClassName="font-semibold text-zinc-700"
                      />
                      <span className="text-zinc-300">•</span>
                      <InlineEditableCell
                        value={job.location}
                        onSave={(val) => handleFieldUpdate(jobApi.updateLocation, val, "location")}
                        placeholder="Location"
                        fieldLabel="Location"
                        textClassName="text-zinc-500"
                      />
                    </div>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-zinc-900">Job Details</h2>
                )}
              </div>
              {job ? <ResumeMatchScore score={job.resumeToJobScore} /> : null}
              {isPage ? null : (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors shrink-0"
                >
                  ✕
                </button>
              )}
              </div>
            </div>

            {isLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <Spinner className="h-6 w-6 text-black" />
                <p className="text-xs">Loading opportunity details...</p>
              </div>
            )}

            {error && (
              <div className="my-4 p-3.5 rounded-2xl bg-red-50 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {!isLoading && job && (
              <div className="py-5 space-y-6 text-xs min-w-0">
                {/* Dynamic Metadata Card Grid (Editable) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 w-full min-w-0">
                  <div className="min-w-0 sm:col-span-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Job status
                    </span>
                    <JobStatusField
                      job={job}
                      onSave={(_currentJob, payload) =>
                        handleFieldUpdate(jobApi.updateJobStatus, payload, "jobStatus")
                      }
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Resume
                    </span>
                    <p className="px-1 py-0.5 text-xs font-medium text-zinc-900">
                      {job.resume ? `Resume ${job.resume}` : "No resume linked"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Salary
                    </span>
                    <InlineEditableCell
                      value={job.salary}
                      onSave={(val) => handleFieldUpdate(jobApi.updateSalary, val, "salary")}
                      placeholder="e.g. $120,000 - $140,000"
                      fieldLabel="Salary"
                      textClassName="font-semibold text-zinc-900"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Work Mode
                    </span>
                    <InlineEditableCell
                      value={job.workMode}
                      onSave={(val) => handleFieldUpdate(jobApi.updateWorkMode, val, "workMode")}
                      fieldLabel="Work Mode"
                      type="select"
                      options={JOBS_WORK_MODE_PRESETS}
                      placeholder="Select Mode"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Employment Type
                    </span>
                    <InlineEditableCell
                      value={job.employmentType}
                      onSave={(val) => handleFieldUpdate(jobApi.updateEmploymentType, val, "employmentType")}
                      fieldLabel="Employment Type"
                      type="select"
                      options={JOBS_EMPLOYMENT_TYPE_PRESETS}
                      placeholder="Select Type"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Experience
                    </span>
                    <InlineEditableCell
                      value={job.experience}
                      onSave={(val) => handleFieldUpdate(jobApi.updateExperience, val, "experience")}
                      placeholder="e.g. 3+ years"
                      fieldLabel="Experience"
                      textClassName="font-semibold text-zinc-900"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Education
                    </span>
                    <InlineEditableCell
                      value={job.education}
                      onSave={(val) => handleFieldUpdate(jobApi.updateEducation, val, "education")}
                      placeholder="e.g. Bachelor's Degree"
                      fieldLabel="Education"
                      textClassName="font-semibold text-zinc-900"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Department
                    </span>
                    <InlineEditableCell
                      value={job.department}
                      onSave={(val) => handleFieldUpdate(jobApi.updateDepartment, val, "department")}
                      placeholder="e.g. Engineering"
                      fieldLabel="Department"
                      textClassName="font-semibold text-zinc-900"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Industry
                    </span>
                    <InlineEditableCell
                      value={job.industry}
                      onSave={(val) => handleFieldUpdate(jobApi.updateIndustry, val, "industry")}
                      placeholder="e.g. Technology"
                      fieldLabel="Industry"
                      textClassName="font-semibold text-zinc-900"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Source Platform
                    </span>
                    <InlineEditableCell
                      value={job.sourcePlatform}
                      onSave={(val) => handleFieldUpdate(jobApi.updateSourcePlatform, val, "sourcePlatform")}
                      placeholder="e.g. LinkedIn"
                      fieldLabel="Source Platform"
                      textClassName="font-semibold text-zinc-900"
                    />
                  </div>
                </div>

                <div className="w-full min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900">Notes</h4>
                    <span className="text-[10px] text-zinc-400">{(job.notes || "").length.toLocaleString()}/5,000</span>
                  </div>
                  <textarea
                    value={job.notes || ""}
                    onChange={(e) => setJob((prev) => ({ ...prev, notes: e.target.value.slice(0, 5000) }))}
                    onBlur={(e) => {
                      handleFieldUpdate(jobApi.updateNotes, e.target.value.slice(0, 5000), "notes").catch(() => {});
                    }}
                    rows={4}
                    placeholder="Add notes about this application..."
                    className="w-full min-w-0 resize-y rounded-2xl border-0 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800 wrap-break-word focus:bg-white focus:outline-none focus:ring-0 hide-scrollbar"
                  />
                </div>

                {/* Required Skills (Full Width & Vertically Scrollable with Add/Remove) */}
                <div className="w-full min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-zinc-900">
                      Required Skills ({splitJobSkills(job.skills).length})
                    </h4>
                    <span className="text-[10px] text-zinc-400">Click + Add or × to edit</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 w-full">
                    <JobSkillsField
                      job={job}
                      onUpdate={(_job, _fieldKey, updateFn, val) => handleFieldUpdate(updateFn, val, "skills")}
                      maxRows={4}
                    />
                  </div>
                </div>

                {/* Original description */}
                <div className="w-full min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 mb-2">Original Posting</h4>
                  <textarea
                    value={job.originalDescription || ""}
                    onChange={(e) => setJob((prev) => ({ ...prev, originalDescription: e.target.value }))}
                    onBlur={(e) => {
                      handleFieldUpdate(jobApi.updateOriginalDescription, e.target.value, "originalDescription").catch(
                        () => {}
                      );
                    }}
                    rows={4}
                    placeholder="Original pasted job text..."
                    className="w-full p-4 rounded-2xl bg-zinc-50 border-0 focus:bg-white focus:outline-none focus:ring-0 transition-all text-xs text-zinc-800 leading-relaxed resize-y wrap-break-word min-w-0 hide-scrollbar"
                  />
                </div>

                {/* Editable Job Description (No Horizontal Overflow) */}
                <div className="w-full min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-zinc-900">Job Description</h4>
                    <button
                      type="button"
                      onClick={handleCopyDescription}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-600 hover:text-black font-medium transition-colors"
                    >
                      {isCopied ? (
                        <span className="text-emerald-600 font-semibold">✓ Copied</span>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={job.description || ""}
                    onChange={(e) => setJob((prev) => ({ ...prev, description: e.target.value }))}
                    onBlur={(e) => {
                      handleFieldUpdate(jobApi.updateDescription, e.target.value, "description").catch(() => {});
                    }}
                    rows={5}
                    placeholder="Paste or edit job description..."
                    className="w-full p-4 rounded-2xl bg-zinc-50 border-0 focus:bg-white focus:outline-none focus:ring-0 transition-all text-xs text-zinc-800 leading-relaxed resize-y wrap-break-word min-w-0 hide-scrollbar"
                  />
                </div>

                {/* Source URL (read-only) */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500 font-medium">Source URL</span>
                    {isSafeHttpUrl(job.sourceUrl) ? (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-ink hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Open ↗</span>
                      </a>
                    ) : null}
                  </div>
                  <p className="text-zinc-700 font-mono text-[11px] truncate max-w-full" title={job.sourceUrl || undefined}>
                    {job.sourceUrl || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {isPage ? (
            <div className="shrink-0 border-t border-zinc-100 px-4 py-1.5 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold leading-none text-ink hover:bg-field whitespace-nowrap"
              >
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to dashboard
              </button>
            </div>
          ) : (
            <div className="shrink-0 pt-4 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          )}
    </>
  );

  if (isPage) {
    return (
      <div className="job-details-page flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
        {detailsBody}
      </div>
    );
  }

  return (
    <div className="job-details-drawer fixed inset-0 z-50 h-dvh w-full overflow-hidden overscroll-none bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex h-full pl-6 sm:pl-10">
        <div
          ref={panelRef}
          className="flex h-full w-screen max-w-xl flex-col overflow-hidden border-l border-zinc-200 bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-250 ease-out"
        >
          {detailsBody}
        </div>
      </div>
    </div>
  );
}
