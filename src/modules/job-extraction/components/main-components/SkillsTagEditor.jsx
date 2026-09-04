import { useRef, useState } from "react";

import { JOB_EXTRACTION_LIMITS } from "../../config/jobExtractionConfig";

export default function SkillsTagEditor({ skills = [], onChange, className = "" }) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const commitDraft = () => {
    const trimmed = draft.trim().slice(0, JOB_EXTRACTION_LIMITS.SKILL_MAX);
    setDraft("");
    if (!trimmed || skills.includes(trimmed)) return;
    if (skills.length >= JOB_EXTRACTION_LIMITS.SKILLS_MAX_COUNT) return;
    onChange([...skills, trimmed]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const handleRemove = (idx) => {
    onChange(skills.filter((_, i) => i !== idx));
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-bg border border-line focus-within:border-ink transition-colors min-h-[42px] ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {skills.map((skill, idx) => (
        <span
          key={`${skill}-${idx}`}
          className="group inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-field text-ink border border-line/80 leading-none"
        >
          {skill}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(idx);
            }}
            className="opacity-50 group-hover:opacity-100 hover:text-danger transition-opacity text-xs leading-none"
            title="Remove skill"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={skills.length === 0 ? "Type a skill and press Enter…" : "Add another…"}
        className="flex-1 min-w-[100px] px-1 py-0.5 text-xs bg-transparent outline-none placeholder:text-muted/70 text-ink"
      />
    </div>
  );
}
