import { useState, useRef, useEffect } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";

export default function InlineEditableCell({
  value = "",
  onSave,
  placeholder = "Click to edit",
  type = "text",
  options = [],
  className = "",
  textClassName = "text-ink font-medium",
  fieldLabel = "Field",
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current && type === "text") {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [isEditing, type]);

  useEffect(() => {
    if (!isOpenMenu) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpenMenu(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpenMenu(false);
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
      setDraftValue(value ?? "");
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setDraftValue(value ?? "");
    setIsEditing(false);
  };

  const handleCommit = async (valToSave = draftValue) => {
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
      setDraftValue(value ?? "");
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

  if (type === "select") {
    const normalizedOptions = options.map((opt) =>
      typeof opt === "object" ? opt : { value: opt, label: opt }
    );
    const currentLabel =
      normalizedOptions.find((o) => o.value === value)?.label || value || placeholder;

    return (
      <div className="relative inline-block max-w-full" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleStartEdit}
          disabled={isSaving}
          title={`Change ${fieldLabel}`}
          className={`group inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border border-transparent bg-field/70 text-ink hover:border-line hover:bg-field focus:outline-none transition-all max-w-full ${className}`}
        >
          <span className="truncate">{currentLabel}</span>
          {isSaving ? (
            <Spinner className="h-2.5 w-2.5 text-ink shrink-0" />
          ) : (
            <svg
              className={`h-3 w-3 text-muted group-hover:text-ink transition-transform duration-150 shrink-0 ${
                isOpenMenu ? "rotate-180 text-ink" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {isOpenMenu ? (
          <div className="absolute top-full left-0 mt-1 min-w-[130px] rounded-xl bg-white border border-line shadow-xl p-1 z-50">
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
                        ? "bg-field text-ink font-semibold"
                        : "text-ink/80 hover:bg-field/80 hover:text-ink"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected ? (
                      <svg className="h-3.5 w-3.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="relative inline-flex items-center w-full" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={() => handleCommit()}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={fieldLabel}
          className="w-full px-2 py-1 text-xs rounded-md bg-white border border-line shadow-xs focus:outline-none focus:border-ink text-ink leading-snug"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      title={value ? String(value) : `Edit ${fieldLabel}`}
      aria-label={value ? `${fieldLabel}: ${value}` : `Edit ${fieldLabel}`}
      className={`group relative inline-flex items-center gap-1 rounded-md px-1 py-0.5 -mx-1 border border-transparent hover:border-line/80 hover:bg-field/80 focus:outline-none transition-colors duration-150 overflow-hidden w-full text-left ${className}`}
    >
      <span
        className={`truncate text-xs border-b border-dotted border-transparent group-hover:border-muted/70 ${
          !value ? "text-muted italic" : textClassName
        }`}
      >
        {value || placeholder}
      </span>
      {isSaving ? <Spinner className="h-3 w-3 text-muted shrink-0" /> : null}
      {justSaved ? (
        <svg className="h-3 w-3 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
    </button>
  );
}
