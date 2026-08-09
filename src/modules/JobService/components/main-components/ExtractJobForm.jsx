import JobSpinner from "../loaders/JobSpinner";

const MAX_TEXT_LENGTH = 50000;

export default function ExtractJobForm({
  sourceUrl,
  rawJobText,
  onSourceUrlChange,
  onRawJobTextChange,
  onExtract,
  isLoading = false,
  isLocked = false,
  errors = {},
}) {
  const canSubmit = sourceUrl.trim().length > 0 && rawJobText.trim().length > 0 && !isLoading && !isLocked;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onExtract();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
      <div className="border-b pb-2 border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900">Extract Job Info</h2>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
          Paste the job posting link and the full text you copied from the page. Our AI will pre-fill the
          form for you to review.
        </p>
      </div>

      <div className="flex-1 min-h-0 hide-scrollbar overflow-y-auto space-y-4">
        {errors.general && (
          <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <span className="font-bold shrink-0">!</span>
            <span>{errors.general}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700">
            Job Posting URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => onSourceUrlChange(e.target.value)}
            placeholder="https://www.linkedin.com/jobs/view/123456789"
            disabled={isLoading || isLocked}
            className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 border focus:bg-white focus:border-black focus:outline-none transition-all placeholder:text-zinc-400 text-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed ${
              errors.url ? "border-red-300" : "border-zinc-200"
            }`}
          />
          {errors.url && <p className="text-[11px] text-red-600 font-medium">{errors.url}</p>}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-700">
              Pasted Job Description <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-zinc-400">
              {rawJobText.length.toLocaleString()}/{MAX_TEXT_LENGTH.toLocaleString()}
            </span>
          </div>
          <textarea
            value={rawJobText}
            onChange={(e) => onRawJobTextChange(e.target.value.slice(0, MAX_TEXT_LENGTH))}
            placeholder="Copy and paste the entire job posting page content here..."
            rows={8}
            disabled={isLoading || isLocked}
            className={`w-full min-h-64 p-3 text-xs rounded-xl hide-scrollbar overflow-y-auto bg-zinc-50 border focus:bg-white focus:border-black focus:outline-none transition-all placeholder:text-zinc-400 text-zinc-900 resize-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed ${
              errors.text ? "border-red-300" : "border-zinc-200"
            }`}
          />
          {errors.text && <p className="text-[11px] text-red-600 font-medium">{errors.text}</p>}
        </div>

        {isLocked && !isLoading && (
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-700 flex items-start gap-2">
            <span className="font-bold shrink-0">✓</span>
            <span>Extracted. Review and edit the fields on the right, or start over below.</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-zinc-100">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 active:scale-[0.99] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <JobSpinner className="h-3.5 w-3.5 text-white" />
              <span>Extracting…</span>
            </>
          ) : isLocked ? (
            "Extracted ✓"
          ) : (
            "Extract Job Info"
          )}
        </button>
      </div>
    </form>
  );
}
