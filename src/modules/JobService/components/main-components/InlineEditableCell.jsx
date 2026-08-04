import { useState, useRef, useEffect } from "react";
import JobSpinner from "../loaders/JobSpinner";

export default function InlineEditableCell({
  value = "",
  onSave,
  placeholder = "Click to edit",
  type = "text",
  options = [],
  className = "",
  textClassName = "text-zinc-900 font-medium",
  fieldLabel = "Field",
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === "text" && inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleStartEdit = (e) => {
    e.stopPropagation();
    if (isSaving) return;
    setCurrentValue(value ?? "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCurrentValue(value ?? "");
    setIsEditing(false);
  };

  const handleCommit = async () => {
    setIsEditing(false);
    const trimmed = String(currentValue ?? "").trim();
    const original = String(value ?? "").trim();

    if (trimmed === original) return;

    try {
      setIsSaving(true);
      await onSave(trimmed);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1200);
    } catch {
      setCurrentValue(value ?? "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    if (type === "select") {
      return (
        <div className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()}>
          <select
            ref={inputRef}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 text-xs rounded-md bg-white border border-black/30 shadow-xs focus:outline-none focus:ring-1 focus:ring-black text-black"
          >
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="relative inline-flex items-center w-full" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-2 py-1 text-xs rounded-md bg-white border border-black/30 shadow-xs focus:outline-none focus:ring-1 focus:ring-black text-black"
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleStartEdit}
      title={`Click to edit ${fieldLabel}`}
      className={`group relative inline-flex items-center gap-1.5 cursor-pointer rounded px-1.5 py-0.5 -mx-1.5 hover:bg-zinc-100/90 transition-colors duration-150 ${className}`}
    >
      <span className={`truncate text-xs ${!value ? "text-zinc-400 italic" : textClassName}`}>
        {value || placeholder}
      </span>
      {isSaving && <JobSpinner className="h-3 w-3 text-zinc-600" />}
      {justSaved && (
        <svg className="h-3 w-3 text-emerald-600 animate-in fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {!isSaving && !justSaved && (
        <svg
          className="h-2.5 w-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )}
    </div>
  );
}
