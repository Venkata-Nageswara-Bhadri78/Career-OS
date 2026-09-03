import { useNavigate } from "react-router-dom";
import InlineEditableCell from "../main-components/InlineEditableCell";
import JobActionsMenu from "../sub-components/JobActionsMenu";
import { JobSkillsField } from "./JobSkillsField";
import {
  JOBS_EMPLOYMENT_TYPE_PRESETS,
  JOBS_WORK_MODE_PRESETS,
} from "../../config/jobsConfig";

export function InteractButton({ jobId }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/jobs/${jobId}/interact`)}
      title="Interact with AI for this job"
      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-ink text-white hover:opacity-90 active:scale-95 transition-all shrink-0"
    >
      <svg className="h-3 w-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <span>Interact</span>
    </button>
  );
}

export function ViewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="View full details"
      className="p-1 rounded-lg text-muted hover:text-ink hover:bg-field transition-colors"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    </button>
  );
}

export function JobRecordActions({
  job,
  onViewClick,
  onDeleteClick,
  compact = false,
  showInteract = true,
  showView = true,
}) {
  return (
    <div
      className={`inline-flex items-center ${compact ? "gap-1" : "gap-1.5"} justify-end`}
      onClick={(e) => e.stopPropagation()}
    >
      {showInteract ? <InteractButton jobId={job.id} /> : null}
      {showView ? <ViewButton onClick={() => onViewClick(job.id)} /> : null}
      <JobActionsMenu job={job} onDeleteClick={onDeleteClick} />
    </div>
  );
}

export { JobSkillsField } from "./JobSkillsField";

export function JobTitleField({ job, onSave }) {
  return (
    <InlineEditableCell
      value={job.title}
      onSave={(val) => onSave(job, val)}
      placeholder="Untitled role"
      fieldLabel="Job title"
      textClassName="font-semibold text-ink leading-snug"
    />
  );
}

export function JobCompanyField({ job, onSave }) {
  return (
    <InlineEditableCell
      value={job.company}
      onSave={(val) => onSave(job, val)}
      placeholder="Company"
      fieldLabel="Company"
      textClassName="text-[11px] text-muted leading-snug"
    />
  );
}

export function JobLocationField({ job, onSave }) {
  return (
    <InlineEditableCell
      value={job.location}
      onSave={(val) => onSave(job, val)}
      placeholder="Set location"
      fieldLabel="Location"
      textClassName="text-xs text-ink font-medium leading-snug"
    />
  );
}

export function JobWorkModeField({ job, onSave }) {
  return (
    <InlineEditableCell
      value={job.workMode}
      onSave={(val) => onSave(job, val)}
      type="select"
      options={JOBS_WORK_MODE_PRESETS}
      placeholder="Work mode"
      fieldLabel="Work mode"
    />
  );
}

export function JobTypeField({ job, onSave }) {
  return (
    <InlineEditableCell
      value={job.employmentType}
      onSave={(val) => onSave(job, val)}
      type="select"
      options={JOBS_EMPLOYMENT_TYPE_PRESETS}
      placeholder="Type"
      fieldLabel="Employment type"
    />
  );
}

export function JobSalaryField({ job, onSave }) {
  return (
    <InlineEditableCell
      value={job.salary}
      onSave={(val) => onSave(job, val)}
      placeholder="Salary"
      fieldLabel="Salary"
      textClassName="text-xs font-medium text-ink leading-snug"
    />
  );
}

export function JobExperienceField({ job, onSave }) {
  return (
    <InlineEditableCell
      value={job.experience}
      onSave={(val) => onSave(job, val)}
      placeholder="Experience"
      fieldLabel="Experience"
      textClassName="text-[11px] text-muted leading-snug"
    />
  );
}
