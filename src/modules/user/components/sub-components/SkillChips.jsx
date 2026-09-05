import { splitSkills } from "../../utils/formatters";

export default function SkillChips({ value, emptyLabel = "No skills added yet." }) {
  const skills = splitSkills(value);

  if (!skills.length) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-lg border border-line bg-field px-3 py-1 text-xs font-medium text-ink"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
