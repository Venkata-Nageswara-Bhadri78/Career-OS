import { useState } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";
import SkillsTagEditor from "./SkillsTagEditor";

const EMPLOYMENT_TYPE_OPTIONS = ["Full Time", "Part Time", "Contract", "Internship"];
const WORK_MODE_OPTIONS = ["Remote", "Hybrid", "On-site"];

function FieldRow({ label, required = false, children, error }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-zinc-100 last:border-b-0">
      <label className="w-36 shrink-0 pt-2 text-xs font-medium text-zinc-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex-1 min-w-0">
        {children}
        {error && <p className="text-[11px] text-red-600 font-medium mt-1">{error}</p>}
      </div>
    </div>
  );
}

function ReadOnlyRow({ label, value, isLink = false }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-zinc-100 last:border-b-0">
      <label className="w-36 shrink-0 pt-2 text-xs font-medium text-zinc-400">{label}</label>
      <div className="flex-1 min-w-0 pt-2">
        {value ? (
          isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-zinc-700 hover:text-black hover:underline break-all"
            >
              {value}
            </a>
          ) : (
            <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto pr-2">
              {value}
            </p>
          )
        ) : (
          <span className="text-xs text-zinc-300 italic">—</span>
        )}
      </div>
    </div>
  );
}

export default function JobReviewForm({
  data,
  onChange,
  onSubmit,
  onStartOver,
  isSubmitting = false,
  error = null,
}) {
  const [validationErrors, setValidationErrors] = useState({});

  const handleFieldChange = (key, value) => {
    onChange(key, value);
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!data.title?.trim()) nextErrors.title = "Job title is required.";
    if (!data.company?.trim()) nextErrors.company = "Company name is required.";
    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      return;
    }
    onSubmit();
  };

  const textInputClass =
    "w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black focus:outline-none transition-all placeholder:text-zinc-400 text-zinc-900";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
      <div className="pb-4 border-b border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900">Review & Edit</h2>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
          We pre-filled everything we could confidently find. Empty fields were not clearly present in
          the posting — fill them in if you know them.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-2">
        {error && (
          <div className="my-3 p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <span className="font-bold shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}

        <FieldRow label="Job Title" required error={validationErrors.title}>
          <input
            type="text"
            value={data.title || ""}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className={`${textInputClass} ${validationErrors.title ? "border-red-300" : ""}`}
          />
        </FieldRow>

        <FieldRow label="Company" required error={validationErrors.company}>
          <input
            type="text"
            value={data.company || ""}
            onChange={(e) => handleFieldChange("company", e.target.value)}
            placeholder="e.g. Stripe"
            className={`${textInputClass} ${validationErrors.company ? "border-red-300" : ""}`}
          />
        </FieldRow>

        <FieldRow label="Location">
          <input
            type="text"
            value={data.location || ""}
            onChange={(e) => handleFieldChange("location", e.target.value)}
            placeholder="e.g. Bengaluru, India"
            className={textInputClass}
          />
        </FieldRow>

        <FieldRow label="Employment Type">
          <input
            type="text"
            list="employment-type-options"
            value={data.employmentType || ""}
            onChange={(e) => handleFieldChange("employmentType", e.target.value)}
            placeholder="e.g. Full Time"
            className={textInputClass}
          />
          <datalist id="employment-type-options">
            {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </FieldRow>

        <FieldRow label="Work Mode">
          <input
            type="text"
            list="work-mode-options"
            value={data.workMode || ""}
            onChange={(e) => handleFieldChange("workMode", e.target.value)}
            placeholder="e.g. Hybrid"
            className={textInputClass}
          />
          <datalist id="work-mode-options">
            {WORK_MODE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </FieldRow>

        <FieldRow label="Experience">
          <input
            type="text"
            value={data.experience || ""}
            onChange={(e) => handleFieldChange("experience", e.target.value)}
            placeholder="e.g. 3-5 Years"
            className={textInputClass}
          />
        </FieldRow>

        <FieldRow label="Salary">
          <input
            type="text"
            value={data.salary || ""}
            onChange={(e) => handleFieldChange("salary", e.target.value)}
            placeholder="e.g. $120,000 - $140,000"
            className={textInputClass}
          />
        </FieldRow>

        <FieldRow label="Education">
          <input
            type="text"
            value={data.education || ""}
            onChange={(e) => handleFieldChange("education", e.target.value)}
            placeholder="e.g. Bachelor's degree"
            className={textInputClass}
          />
        </FieldRow>

        <FieldRow label="Department">
          <input
            type="text"
            value={data.department || ""}
            onChange={(e) => handleFieldChange("department", e.target.value)}
            placeholder="e.g. Core Engineering"
            className={textInputClass}
          />
        </FieldRow>

        <FieldRow label="Industry">
          <input
            type="text"
            value={data.industry || ""}
            onChange={(e) => handleFieldChange("industry", e.target.value)}
            placeholder="e.g. Financial Technology"
            className={textInputClass}
          />
        </FieldRow>

        <FieldRow label="Source Platform">
          <input
            type="text"
            value={data.sourcePlatform || ""}
            onChange={(e) => handleFieldChange("sourcePlatform", e.target.value)}
            placeholder="e.g. LinkedIn"
            className={textInputClass}
          />
        </FieldRow>

        <FieldRow label="Skills">
          <SkillsTagEditor
            skills={data.skills || []}
            onChange={(skills) => handleFieldChange("skills", skills)}
          />
        </FieldRow>

        <FieldRow label="Description">
          <textarea
            value={data.description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="AI-cleaned summary of the role…"
            rows={4}
            className={`${textInputClass} resize-none leading-relaxed`}
          />
        </FieldRow>

        <div className="mt-2 pt-2">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 px-0.5">
            Source Reference (auto-detected, read-only)
          </p>
          <ReadOnlyRow label="Source URL" value={data.sourceUrl} isLink />
          <ReadOnlyRow label="Original Text" value={data.originalDescription} />
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onStartOver}
          disabled={isSubmitting}
          className="px-3 py-2 text-xs font-medium text-zinc-500 hover:text-black transition-colors disabled:opacity-50"
        >
          ← Start Over
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-3.5 w-3.5 text-white" />
              <span>Adding…</span>
            </>
          ) : (
            "Add Record"
          )}
        </button>
      </div>
    </form>
  );
}
