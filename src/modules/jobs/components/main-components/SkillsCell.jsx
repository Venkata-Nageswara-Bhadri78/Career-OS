import { useState, useRef, useEffect } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";

export default function SkillsCell({ skills = [], onSave, className = "", maxRows = 2 }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleRemove = async (indexToRemove, e) => {
    e.stopPropagation();
    if (isSaving) return;
    const updated = skills.filter((_, idx) => idx !== indexToRemove);
    if (updated.length === 0) return;
    try {
      setIsSaving(true);
      await onSave(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed) {
      setIsAdding(false);
      setNewSkill("");
      return;
    }
    setIsAdding(false);
    setNewSkill("");
    if (skills.includes(trimmed)) return;
    const updated = [...skills, trimmed];
    try {
      setIsSaving(true);
      await onSave(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsAdding(false);
      setNewSkill("");
    }
  };

  const scrollMaxHeight = maxRows === 2 ? "max-h-[2.125rem]" : "max-h-[3.25rem]";

  return (
    <div className={`w-full min-w-0 ${className}`} onClick={(e) => e.stopPropagation()}>
      <div className={`${scrollMaxHeight} overflow-y-auto hide-scrollbar`}>
        <div className="flex flex-wrap gap-0.5 items-center leading-none">
          {(skills || []).map((skill, idx) => (
            <span
              key={`${skill}-${idx}`}
              className="group inline-flex items-center gap-0.5 px-1 py-px text-[10px] font-medium rounded bg-field text-ink border border-line/80 shrink-0"
            >
              <span className="max-w-[72px] truncate">{skill}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(idx, e)}
                className="opacity-40 group-hover:opacity-100 hover:text-danger transition-opacity text-[10px] leading-none"
                title="Remove skill"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}

          {isAdding ? (
            <input
              ref={inputRef}
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onBlur={handleAdd}
              onKeyDown={handleKeyDown}
              placeholder="Skill..."
              aria-label="Add skill"
              className="w-14 px-1 py-px text-[10px] rounded bg-white border border-ink/30 outline-none text-ink leading-none shrink-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              disabled={isSaving}
              className="inline-flex items-center px-1 py-px text-[10px] font-medium text-muted rounded hover:bg-field hover:text-ink transition-colors leading-none shrink-0 disabled:opacity-50"
            >
              + Add
            </button>
          )}

          {isSaving ? <Spinner className="h-2.5 w-2.5 text-muted shrink-0" /> : null}
        </div>
      </div>
    </div>
  );
}
