import { useState, useEffect } from "react";
import InlineEditableCell from "./InlineEditableCell";
import SkillsCell from "./SkillsCell";
import { formatDate } from "../../helpers/jobFormatters";
import jobApi from "../../api/jobApi";
import JobSpinner from "../loaders/JobSpinner";

export default function JobDetailsDrawer({ isOpen, jobId, onClose, onJobUpdated }) {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (isOpen && jobId) {
      async function load() {
        try {
          setIsLoading(true);
          setError(null);
          const data = await jobApi.getJobById(jobId);
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
  }, [isOpen, jobId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleFieldUpdate = async (fieldUpdater, val, fieldKey) => {
    if (!job) return;
    const updated = await fieldUpdater(job.id, val);
    setJob((prev) => ({ ...prev, [fieldKey]: val }));
    if (onJobUpdated) onJobUpdated(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-zinc-200 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-100 text-zinc-600">ID #{jobId}</span>
                  <span className="text-xs text-zinc-400">Created {formatDate(job?.createdAt)}</span>
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mt-1">
                  {job?.title || "Job Details"}
                </h2>
                <p className="text-xs text-zinc-500">{job?.company || "Company"}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {isLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <JobSpinner className="h-6 w-6 text-black" />
                <p className="text-xs">Loading application details...</p>
              </div>
            )}

            {error && (
              <div className="my-4 p-3 rounded-xl bg-red-50 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {!isLoading && job && (
              <div className="py-5 space-y-6 text-xs">
                {/* Primary Overview Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Job Title</span>
                    <InlineEditableCell
                      value={job.title}
                      onSave={(val) => handleFieldUpdate(jobApi.updateTitle, val, "title")}
                      fieldLabel="Title"
                      textClassName="font-semibold text-zinc-900"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Company</span>
                    <InlineEditableCell
                      value={job.company}
                      onSave={(val) => handleFieldUpdate(jobApi.updateCompany, val, "company")}
                      fieldLabel="Company"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Location</span>
                    <InlineEditableCell
                      value={job.location}
                      onSave={(val) => handleFieldUpdate(jobApi.updateLocation, val, "location")}
                      fieldLabel="Location"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Salary</span>
                    <InlineEditableCell
                      value={job.salary}
                      onSave={(val) => handleFieldUpdate(jobApi.updateSalary, val, "salary")}
                      fieldLabel="Salary"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Work Mode</span>
                    <InlineEditableCell
                      value={job.workMode}
                      onSave={(val) => handleFieldUpdate(jobApi.updateWorkMode, val, "workMode")}
                      fieldLabel="Work Mode"
                      type="select"
                      options={["Remote", "Hybrid", "On-site"]}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Employment Type</span>
                    <InlineEditableCell
                      value={job.employmentType}
                      onSave={(val) => handleFieldUpdate(jobApi.updateEmploymentType, val, "employmentType")}
                      fieldLabel="Employment Type"
                      type="select"
                      options={["Full Time", "Part Time", "Contract", "Internship"]}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Experience</span>
                    <InlineEditableCell
                      value={job.experience}
                      onSave={(val) => handleFieldUpdate(jobApi.updateExperience, val, "experience")}
                      fieldLabel="Experience"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Education</span>
                    <InlineEditableCell
                      value={job.education}
                      onSave={(val) => handleFieldUpdate(jobApi.updateEducation, val, "education")}
                      fieldLabel="Education"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Department</span>
                    <InlineEditableCell
                      value={job.department}
                      onSave={(val) => handleFieldUpdate(jobApi.updateDepartment, val, "department")}
                      fieldLabel="Department"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Industry</span>
                    <InlineEditableCell
                      value={job.industry}
                      onSave={(val) => handleFieldUpdate(jobApi.updateIndustry, val, "industry")}
                      fieldLabel="Industry"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 mb-2">Required Skills</h4>
                  <SkillsCell
                    skills={job.skills || []}
                    onSave={(newSkills) => handleFieldUpdate(jobApi.updateSkills, newSkills, "skills")}
                  />
                </div>

                {/* Cleaned Description */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 mb-1.5">Processed Description</h4>
                  <textarea
                    value={job.description || ""}
                    onChange={(e) => setJob((prev) => ({ ...prev, description: e.target.value }))}
                    onBlur={(e) => handleFieldUpdate(jobApi.updateDescription, e.target.value, "description")}
                    rows={4}
                    placeholder="Add cleaned description..."
                    className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black focus:outline-none transition-all text-xs text-zinc-800"
                  />
                </div>

                {/* Source Information */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Source Platform</span>
                    <InlineEditableCell
                      value={job.sourcePlatform}
                      onSave={(val) => handleFieldUpdate(jobApi.updateSourcePlatform, val, "sourcePlatform")}
                      fieldLabel="Source Platform"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Source URL</span>
                    {job.sourceUrl ? (
                      <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-black font-medium hover:underline truncate max-w-70">
                        {job.sourceUrl}
                      </a>
                    ) : (
                      <span className="text-zinc-400 italic">None provided</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-black text-white hover:bg-zinc-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
