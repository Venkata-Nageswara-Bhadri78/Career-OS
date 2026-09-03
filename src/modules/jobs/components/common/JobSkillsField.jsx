import SkillsCell from "../main-components/SkillsCell";
import jobApi from "../../api/jobApi";

export function JobSkillsField({ job, onUpdate, editable = true, maxRows = 2 }) {
  if (!editable) {
    return (
      <span className="text-[10px] text-ink truncate" title={(job.skills || []).join(", ")}>
        {(job.skills || []).join(", ") || "—"}
      </span>
    );
  }

  return (
    <SkillsCell
      key={`${job.id}-${(job.skills || []).length}-${(job.skills || []).join("|")}`}
      skills={job.skills || []}
      maxRows={maxRows}
      onSave={(val) => onUpdate(job, "skills", jobApi.updateSkills, val, "Skills")}
    />
  );
}
