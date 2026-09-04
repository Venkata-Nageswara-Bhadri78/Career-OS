import { useState } from "react";
import Spinner from "../../../../common/components/loaders/Spinner";
import SkillsTagEditor from "./SkillsTagEditor";
import {
  EMPLOYMENT_TYPE_SUGGESTIONS,
  WORK_MODE_SUGGESTIONS,
} from "../../config/jobExtractionConfig";
import { validateReviewForm } from "../../mappers/jobExtractionMapper";

function FieldRow({ label, required = false, children, error, highlight = false }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-line last:border-b-0">
      <label className="w-36 shrink-0 pt-2 text-xs font-medium text-muted">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="flex-1 min-w-0">
        <div className={highlight ? "job-extraction-manual-review rounded-lg p-0.5" : undefined}>{children}</div>
        {error && <p className="text-[11px] text-danger font-medium mt-1">{error}</p>}
      </div>
    </div>
  );
}

function ReadOnlyRow({ label, value, isLink = false, clamp = false }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-line last:border-b-0">
      <span className="w-36 shrink-0 pt-2 text-xs font-medium text-muted/70">{label}</span>
      <div className="flex-1 min-w-0 pt-2">
        {value ? (
          isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-ink hover:underline break-all"
            >
              {value}
            </a>
          ) : (
            <p
              className={`text-xs text-muted leading-relaxed whitespace-pre-wrap break-words ${
                clamp ? "job-extraction-clamped-text" : ""
              }`}
            >
              {value}
            </p>
          )
        ) : (
          <span className="text-xs text-muted/40 italic">—</span>
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
  urlWasCleaned = false,
  inputUrl = "",
}) {
  const [validationErrors, setValidationErrors] = useState({});
  const needsManualReview = Boolean(data.requiresManualReview);

  const handleFieldChange = (key, value) => {
    onChange(key, value);
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateReviewForm(data);
    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      return;
    }
    setValidationErrors({});
    onSubmit();
  };

  const textInputClass =
    "w-full px-3 py-2 text-xs rounded-lg bg-field border border-line focus:bg-bg focus:border-ink focus:outline-none transition-all placeholder:text-muted/70 text-ink";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="pb-4 border-b border-line shrink-0">
        <h2 className="text-lg font-bold text-ink">Review & Edit</h2>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">
          We pre-filled everything we could confidently find. Empty fields were not clearly present in
          the posting — fill them in if you know them.
        </p>
        {needsManualReview && (
          <p className="mt-2 text-[11px] font-medium text-accent" role="status">
            Title and company need your attention before you can save this record.
          </p>
        )}
        {urlWasCleaned && (
          <p className="mt-2 text-[11px] text-muted" role="status">
            Link cleaned for storage
            {inputUrl.trim() ? `: your input differed from the canonical URL below.` : "."}
          </p>
        )}
      </div>

      <div className="py-2">
        {error && (
          <div
            className="my-3 p-3 rounded-xl bg-danger/5 border border-danger/20 text-xs text-danger flex items-start gap-2"
            role="alert"
          >
            <span className="font-bold shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}

        <FieldRow
          label="Job Title"
          required
          error={validationErrors.title}
          highlight={needsManualReview && !data.title?.trim()}
        >
          <input
            type="text"
            value={data.title || ""}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            aria-required="true"
            className={`${textInputClass} ${validationErrors.title ? "border-danger/40" : ""}`}
          />
        </FieldRow>

        <FieldRow
          label="Company"
          required
          error={validationErrors.company}
          highlight={needsManualReview && !data.company?.trim()}
        >
          <input
            type="text"
            value={data.company || ""}
            onChange={(e) => handleFieldChange("company", e.target.value)}
            placeholder="e.g. Stripe"
            aria-required="true"
            className={`${textInputClass} ${validationErrors.company ? "border-danger/40" : ""}`}
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
            {EMPLOYMENT_TYPE_SUGGESTIONS.map((opt) => (
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
            {WORK_MODE_SUGGESTIONS.map((opt) => (
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

        <FieldRow label="Skills" error={validationErrors.skills}>
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
            rows={3}
            className={`${textInputClass} job-extraction-field-grow leading-relaxed`}
          />
        </FieldRow>

        <div className="mt-2 pt-2">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 px-0.5">
            Source Reference (auto-detected, read-only)
          </p>
          <ReadOnlyRow label="Source URL" value={data.sourceUrl} isLink />
          <ReadOnlyRow label="Original Text" value={data.originalDescription} clamp />
        </div>
      </div>

      <div className="pt-3 border-t border-line flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={onStartOver}
          disabled={isSubmitting}
          className="px-3 py-2 text-xs font-medium text-muted hover:text-ink transition-colors disabled:opacity-50"
        >
          ← Start Over
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-semibold rounded-xl bg-accent text-ink hover:opacity-90 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-3.5 w-3.5 text-ink" />
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
