import { useState, useRef, useEffect } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";

export default function SkillsCell({ skills = [], onSave, className = "" }) {
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
    try {
      setIsSaving(true);
      await onSave(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = newSkill.trim();
    setIsAdding(false);
    setNewSkill("");
    if (!trimmed || skills.includes(trimmed)) return;
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

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 w-full ${className || "max-h-24 overflow-y-auto"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {(skills || []).map((skill, idx) => (
        <span
          key={idx}
          className="group inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-100 text-zinc-800 border border-zinc-200/80 leading-none transition-all hover:bg-zinc-200"
        >
          {skill}
          <button
            type="button"
            onClick={(e) => handleRemove(idx, e)}
            className="opacity-40 group-hover:opacity-100 hover:text-red-600 transition-opacity text-[10px] leading-none"
            title="Remove skill"
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
          className="w-14 px-1 py-0.5 text-[10px] rounded bg-white border border-black/30 outline-none text-black leading-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 rounded hover:bg-zinc-100 hover:text-black transition-colors leading-none"
        >
          + Add
        </button>
      )}

      {isSaving && <Spinner className="h-2.5 w-2.5 text-zinc-600 ml-0.5" />}
    </div>
  );
}
