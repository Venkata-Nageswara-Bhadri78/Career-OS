import { useState, useEffect } from "react";
import InlineEditableCell from "./InlineEditableCell";
import SkillsCell from "./SkillsCell";
import { formatDate } from "../../helpers/jobFormatters";
import jobApi from "../../api/jobApi";
import Spinner from "../../../../common/components/loaders/Spinner";
import { copyToClipboard } from "../../../ai/helpers/aiFormatters";

export default function JobDetailsDrawer({
  isOpen,
  jobId = null,
  job: initialJob = null,
  onClose,
  onJobUpdated,
}) {
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
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleFieldUpdate = async (fieldUpdater, val, fieldKey) => {
    if (!job) return;
    try {
      const updated = await fieldUpdater(job.id, val);
      const merged = { ...job, [fieldKey]: val };
      setJob(merged);
      if (onJobUpdated) onJobUpdated(updated || merged);
    } catch (err) {
      console.error(`Failed to update ${fieldKey}:`, err);
    }
  };

  const handleCopyDescription = async () => {
    const text = job?.description || job?.originalDescription || `${job?.title} at ${job?.company}`;
    await copyToClipboard(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-zinc-200 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto overflow-x-hidden animate-in slide-in-from-right duration-250 ease-out">
          <div className="min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100 min-w-0">
              <div className="min-w-0 pr-3 flex-1">
                {job?.createdAt && (
                  <div className="text-[11px] font-medium text-zinc-400 mb-1">
                    Created {formatDate(job.createdAt)}
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
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors shrink-0"
              >
                ✕
              </button>
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
                      options={["Remote", "Hybrid", "On-site"]}
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
                      options={["Full Time", "Part Time", "Contract", "Internship"]}
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

                {/* Required Skills (Full Width & Vertically Scrollable with Add/Remove) */}
                <div className="w-full min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-zinc-900">
                      Required Skills ({job.skills?.length || 0})
                    </h4>
                    <span className="text-[10px] text-zinc-400">Click + Add or × to edit</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 w-full">
                    <SkillsCell
                      skills={job.skills || []}
                      onSave={(newSkills) => handleFieldUpdate(jobApi.updateSkills, newSkills, "skills")}
                      className="max-h-48 overflow-y-auto w-full gap-2"
                    />
                  </div>
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
                    onBlur={(e) => handleFieldUpdate(jobApi.updateDescription, e.target.value, "description")}
                    rows={5}
                    placeholder="Paste or edit job description..."
                    className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-black focus:outline-none transition-all text-xs text-zinc-800 leading-relaxed resize-y wrap-break-word min-w-0"
                  />
                </div>

                {/* Source URL (Editable & Clickable) */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500 font-medium">Source URL</span>
                    {job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Open ↗</span>
                      </a>
                    )}
                  </div>
                  <InlineEditableCell
                    value={job.sourceUrl}
                    onSave={(val) => handleFieldUpdate(jobApi.updateSourceUrl, val, "sourceUrl")}
                    placeholder="https://company.com/careers/job"
                    fieldLabel="Source URL"
                    textClassName="text-zinc-700 font-mono text-[11px] truncate block max-w-md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
