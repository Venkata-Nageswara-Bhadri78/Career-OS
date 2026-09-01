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
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current && type === "text") {
      inputRef.current.focus();
      if (inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  // Handle outside click for custom dropdown
  useEffect(() => {
    if (!isOpenMenu) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpenMenu(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpenMenu]);

  const handleStartEdit = (e) => {
    e.stopPropagation();
    if (isSaving) return;
    if (type === "select") {
      setIsOpenMenu((prev) => !prev);
    } else {
      setCurrentValue(value ?? "");
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value ?? "");
    setIsEditing(false);
  };

  const handleCommit = async (valToSave = currentValue) => {
    setIsEditing(false);
    setIsOpenMenu(false);
    const trimmed = String(valToSave ?? "").trim();
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

  // Custom Popover Selection for type === "select"
  if (type === "select") {
    const normalizedOptions = options.map((opt) =>
      typeof opt === "object" ? opt : { value: opt, label: opt }
    );
    const currentLabel =
      normalizedOptions.find((o) => o.value === value)?.label || value || placeholder;

    return (
      <div className="relative inline-block" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleStartEdit}
          disabled={isSaving}
          title={`Change ${fieldLabel}`}
          className={`group inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white text-zinc-900 border border-zinc-200/90 shadow-2xs hover:border-zinc-400 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all ${className}`}
        >
          <span className="truncate">{currentLabel}</span>
          {isSaving ? (
            <JobSpinner className="h-2.5 w-2.5 text-zinc-700 shrink-0" />
          ) : (
            <svg
              className={`h-3 w-3 text-zinc-400 group-hover:text-zinc-900 transition-transform duration-150 shrink-0 ${
                isOpenMenu ? "rotate-180 text-zinc-900" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {isOpenMenu && (
          <div className="absolute top-full left-0 mt-1 min-w-[130px] rounded-xl bg-white border border-zinc-200/90 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">

            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleCommit(opt.value)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-left font-medium transition-colors ${
                      isSelected
                        ? "bg-zinc-100 text-zinc-900 font-semibold"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-black"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <svg className="h-3.5 w-3.5 text-black shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Text Inline Editor
  if (isEditing) {
    return (
      <div className="relative inline-flex items-center w-full" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={() => handleCommit()}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-black shadow-xs focus:outline-none focus:ring-2 focus:ring-black/10 text-black leading-snug"
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
      {isSaving && <JobSpinner className="h-3 w-3 text-zinc-600 shrink-0" />}
      {justSaved && (
        <svg className="h-3 w-3 text-emerald-600 animate-in fade-in shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {!isSaving && !justSaved && (
        <svg
          className="h-2.5 w-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
