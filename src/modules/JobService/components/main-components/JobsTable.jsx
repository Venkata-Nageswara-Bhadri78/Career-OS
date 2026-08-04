import { useState } from "react";
import InlineEditableCell from "./InlineEditableCell";
import SkillsCell from "./SkillsCell";
import { getWorkModeClass, getEmploymentTypeClass } from "../../helpers/jobFormatters";
import jobApi from "../../api/jobApi";

export default function JobsTable({
  jobs = [],
  onDeleteClick,
  onViewClick,
  onJobFieldUpdated,
  page = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
}) {
  const [undoState, setUndoState] = useState(null); // { jobId, fieldKey, previousValue, label }

  const handleUpdate = async (jobId, fieldKey, updateFn, newValue, label) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    const previousValue = targetJob ? targetJob[fieldKey] : null;

    try {
      const updatedJob = await updateFn(jobId, newValue);
      if (onJobFieldUpdated) onJobFieldUpdated(updatedJob);

      // Set Undo Toast
      setUndoState({
        jobId,
        fieldKey,
        previousValue,
        label,
        updateFn,
        timer: setTimeout(() => setUndoState(null), 5000),
      });
    } catch (err) {
      alert(`Failed to update ${label}: ${err.message}`);
    }
  };

  const handleUndo = async () => {
    if (!undoState) return;
    clearTimeout(undoState.timer);
    const { jobId, previousValue, updateFn, label } = undoState;
    setUndoState(null);

    try {
      const restoredJob = await updateFn(jobId, previousValue);
      if (onJobFieldUpdated) onJobFieldUpdated(restoredJob);
    } catch (err) {
      alert(`Failed to undo ${label}: ${err.message}`);
    }
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-zinc-200/80 bg-white/70 backdrop-blur-md p-12 text-center shadow-xs">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-zinc-900">No Job Applications Found</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Start by clicking "+ Add Job" above to paste a job posting payload.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 backdrop-blur-md shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/75">
              <th className="py-3 px-4 font-semibold text-zinc-500 w-[24%]">Role & Company</th>
              <th className="py-3 px-4 font-semibold text-zinc-500 w-[14%]">Location</th>
              <th className="py-3 px-4 font-semibold text-zinc-500 w-[14%]">Work Mode / Type</th>
              <th className="py-3 px-4 font-semibold text-zinc-500 w-[14%]">Salary & Exp</th>
              <th className="py-3 px-4 font-semibold text-zinc-500 w-[22%]">Skills</th>
              <th className="py-3 px-4 font-semibold text-zinc-500 w-[12%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => onViewClick(job.id)}
                className="group hover:bg-zinc-50/80 cursor-pointer transition-colors duration-100"
              >
                {/* Title & Company */}
                <td className="py-2.5 px-4 w-[24%] align-top">
                  <div className="flex flex-col">
                    <InlineEditableCell
                      value={job.title}
                      onSave={(val) => handleUpdate(job.id, "title", jobApi.updateTitle, val, "Title")}
                      placeholder="Untitled Role"
                      fieldLabel="Title"
                      textClassName="font-semibold text-zinc-900"
                    />
                    <InlineEditableCell
                      value={job.company}
                      onSave={(val) => handleUpdate(job.id, "company", jobApi.updateCompany, val, "Company")}
                      placeholder="Company"
                      fieldLabel="Company"
                      textClassName="text-[11px] text-zinc-500"
                    />
                  </div>
                </td>

                {/* Location */}
                <td className="py-2.5 px-4 w-[14%] align-top">
                  <InlineEditableCell
                    value={job.location}
                    onSave={(val) => handleUpdate(job.id, "location", jobApi.updateLocation, val, "Location")}
                    placeholder="Set location"
                    fieldLabel="Location"
                    textClassName="text-zinc-700 font-medium"
                  />
                </td>

                {/* Work Mode & Employment Type */}
                <td className="py-2.5 px-4 w-[14%] align-top">
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded border ${getWorkModeClass(job.workMode)}`}>
                      <InlineEditableCell
                        value={job.workMode}
                        onSave={(val) => handleUpdate(job.id, "workMode", jobApi.updateWorkMode, val, "Work Mode")}
                        type="select"
                        options={["Remote", "Hybrid", "On-site"]}
                        placeholder="Mode"
                        fieldLabel="Work Mode"
                        textClassName="font-medium"
                      />
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded border ${getEmploymentTypeClass(job.employmentType)}`}>
                      <InlineEditableCell
                        value={job.employmentType}
                        onSave={(val) => handleUpdate(job.id, "employmentType", jobApi.updateEmploymentType, val, "Employment Type")}
                        type="select"
                        options={["Full Time", "Part Time", "Contract", "Internship"]}
                        placeholder="Type"
                        fieldLabel="Employment Type"
                        textClassName="font-medium"
                      />
                    </span>
                  </div>
                </td>

                {/* Salary & Experience */}
                <td className="py-2.5 px-4 w-[14%] align-top">
                  <div className="flex flex-col">
                    <InlineEditableCell
                      value={job.salary}
                      onSave={(val) => handleUpdate(job.id, "salary", jobApi.updateSalary, val, "Salary")}
                      placeholder="Salary"
                      fieldLabel="Salary"
                      textClassName="font-medium text-zinc-900"
                    />
                    <InlineEditableCell
                      value={job.experience}
                      onSave={(val) => handleUpdate(job.id, "experience", jobApi.updateExperience, val, "Experience")}
                      placeholder="Experience"
                      fieldLabel="Experience"
                      textClassName="text-[11px] text-zinc-500"
                    />
                  </div>
                </td>

                {/* Skills */}
                <td className="py-2.5 px-4 w-[22%] align-top">
                  <SkillsCell
                    skills={job.skills || []}
                    onSave={(val) => handleUpdate(job.id, "skills", jobApi.updateSkills, val, "Skills")}
                  />
                </td>

                {/* Actions */}
                <td className="py-2.5 px-4 w-[12%] align-top text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onViewClick(job.id)}
                      title="View full details"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteClick(job)}
                      title="Delete application"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/50 text-xs text-zinc-500">
        <span>
          Showing <strong className="text-zinc-900">{jobs.length}</strong> of <strong className="text-zinc-900">{totalElements}</strong> saved jobs
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 0}
            className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            Previous
          </button>
          <span className="px-2 font-medium text-zinc-700">
            Page {page + 1} of {Math.max(1, totalPages)}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            Next
          </button>
        </div>
      </div>

      {/* Undo Toast Notification Bar */}
      {undoState && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black text-white text-xs shadow-xl animate-in slide-in-from-bottom-2 duration-150">
          <span>Updated {undoState.label}</span>
          <button
            type="button"
            onClick={handleUndo}
            className="font-bold underline underline-offset-2 text-zinc-300 hover:text-white"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
