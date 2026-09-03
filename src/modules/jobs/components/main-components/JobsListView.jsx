import {
  JobCompanyField,
  JobExperienceField,
  JobLocationField,
  JobRecordActions,
  JobSalaryField,
  JobSkillsField,
  JobTitleField,
  JobTypeField,
  JobWorkModeField,
} from "../common/JobRecordFields";
import { createJobFieldHandlers } from "../../utils/jobFieldHandlers";

export default function JobsListView({
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
    <div className="flex-1 min-h-0 overflow-y-auto">
      {updateError ? (
        <p className="mx-2 mb-1 px-2 py-1.5 text-[11px] text-danger bg-red-50 border border-red-200 rounded-lg" role="alert">
          {updateError}
        </p>
      ) : null}
      <table className="w-full table-fixed text-left border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-line bg-field/95 backdrop-blur-sm">
            <th className="py-2 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted w-[19%]">
              Job title
            </th>
            <th className="py-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted w-[10%]">Company</th>
            <th className="py-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted w-[10%]">Location</th>
            <th className="py-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted w-[8%]">Work mode</th>
            <th className="py-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted w-[8%]">Type</th>
            <th className="py-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted w-[8%]">Salary</th>
            <th className="py-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted w-[7%]">Experience</th>
            <th className="py-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted w-[17%]">Skills</th>
            <th className="py-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted w-[13%] text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="group hover:bg-field/50 transition-colors cursor-pointer"
              onClick={() => onViewClick(job.id)}
            >
              <td className="py-2 px-1.5 align-top max-w-0">
                <JobTitleField job={job} onSave={fields.title} />
              </td>
              <td className="py-2 px-1 align-top max-w-0">
                <JobCompanyField job={job} onSave={fields.company} />
              </td>
              <td className="py-2 px-1 align-top max-w-0">
                <JobLocationField job={job} onSave={fields.location} />
              </td>
              <td className="py-2 px-1 align-top max-w-0">
                <JobWorkModeField job={job} onSave={fields.workMode} />
              </td>
              <td className="py-2 px-1 align-top max-w-0">
                <JobTypeField job={job} onSave={fields.employmentType} />
              </td>
              <td className="py-2 px-1 align-top max-w-0">
                <JobSalaryField job={job} onSave={fields.salary} />
              </td>
              <td className="py-2 px-1 align-top max-w-0">
                <JobExperienceField job={job} onSave={fields.experience} />
              </td>
              <td className="py-2 px-1 align-top max-w-0" onClick={(e) => e.stopPropagation()}>
                <JobSkillsField job={job} onUpdate={onUpdate} maxRows={2} />
              </td>
              <td className="py-2 px-1 align-middle">
                <JobRecordActions job={job} onViewClick={onViewClick} onDeleteClick={onDeleteClick} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
