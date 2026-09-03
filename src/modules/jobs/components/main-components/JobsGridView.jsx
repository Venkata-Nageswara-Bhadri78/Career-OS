import { formatDate } from "../../utils/formatters";
import {
  JobCompanyField,
  JobExperienceField,
  JobLocationField,
  InteractButton,
  ViewButton,
  JobRecordActions,
  JobSalaryField,
  JobSkillsField,
  JobTitleField,
  JobTypeField,
  JobWorkModeField,
} from "../common/JobRecordFields";
import { createJobFieldHandlers } from "../../utils/jobFieldHandlers";

export default function JobsGridView({
  jobs,
  onViewClick,
  onDeleteClick,
  onUpdate,
  updateError,
}) {
  const fields = createJobFieldHandlers(onUpdate);

  if (!jobs.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto h-10 w-10 rounded-lg bg-field flex items-center justify-center text-muted mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-ink">No saved jobs yet</h3>
          <p className="text-xs text-muted mt-1">Add a job posting to start tracking opportunities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-1.5">
      {updateError ? (
        <p className="mb-1 px-2 py-1.5 text-[11px] text-danger bg-red-50 border border-red-200 rounded-lg" role="alert">
          {updateError}
        </p>
      ) : null}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="rounded-lg border border-line bg-white p-3 shadow-xs hover:shadow-sm hover:border-ink/20 transition-all cursor-pointer flex flex-col gap-2.5 min-w-0"
            onClick={() => onViewClick(job.id)}
          >
            <div className="flex items-start justify-between gap-1.5 min-w-0">
              <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
                <JobTitleField job={job} onSave={fields.title} />
                <div className="mt-0.5">
                  <JobCompanyField job={job} onSave={fields.company} />
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <JobRecordActions
                  job={job}
                  onViewClick={onViewClick}
                  onDeleteClick={onDeleteClick}
                  compact
                  showInteract={false}
                  showView={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
              <div className="min-w-0">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted block mb-0.5">
                  Location
                </span>
                <JobLocationField job={job} onSave={fields.location} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted block mb-0.5">
                  Work mode
                </span>
                <JobWorkModeField job={job} onSave={fields.workMode} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted block mb-0.5">Type</span>
                <JobTypeField job={job} onSave={fields.employmentType} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted block mb-0.5">
                  Experience
                </span>
                <JobExperienceField job={job} onSave={fields.experience} />
              </div>
              <div className="min-w-0 col-span-2">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted block mb-0.5">
                  Salary
                </span>
                <JobSalaryField job={job} onSave={fields.salary} />
              </div>
              <div className="min-w-0 col-span-2">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted block mb-0.5">
                  Skills
                </span>
                <JobSkillsField job={job} onUpdate={onUpdate} maxRows={2} />
              </div>
            </div>

            <div
              className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-line/70"
              onClick={(e) => e.stopPropagation()}
            >
              {job.createdAt ? (
                <p className="text-[9px] text-muted min-w-0 truncate">Added {formatDate(job.createdAt)}</p>
              ) : (
                <span />
              )}
              <div className="inline-flex items-center gap-1 shrink-0">
                <ViewButton onClick={() => onViewClick(job.id)} />
                <InteractButton jobId={job.id} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
