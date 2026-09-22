import SkillsCell from "../main-components/SkillsCell";
import jobApi from "../../api/jobApi";
import { joinJobSkills, splitJobSkills } from "../../utils/formatters";

export function JobSkillsField({ job, onUpdate, editable = true, maxRows = 2 }) {
  const skillList = splitJobSkills(job.skills);
  const skillsText = skillList.join(", ");

  if (!editable) {
    return (
      <span className="text-[10px] text-ink truncate" title={skillsText}>
        {skillsText || "—"}
      </span>
    );
  }

  return (
    <SkillsCell
      key={`${job.id}-${skillList.length}-${skillsText}`}
      skills={skillList}
      maxRows={maxRows}
      onSave={(val) => onUpdate(job, "skills", jobApi.updateSkills, joinJobSkills(val), "Skills")}
    />
  );
}
