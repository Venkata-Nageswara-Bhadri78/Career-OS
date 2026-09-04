import ExtractJobForm from "./ExtractJobForm";
import JobExtractionEmptyState from "./JobExtractionEmptyState";
import JobReviewForm from "./JobReviewForm";
import JobExtractionLoader from "../loaders/JobExtractionLoader";
import useJobExtraction from "../../hooks/useJobExtraction";
import "../../styles/jobExtraction.css";

export default function AddJobModal({ isOpen, onClose, onSubmit }) {
  const {
    step,
    sourceUrl,
    rawJobText,
    extractErrors,
    reviewData,
    saveError,
    isSaving,
    retryAfter,
    urlWasCleaned,
    setSourceUrl,
    setRawJobText,
    handleExtract,
    handleReviewFieldChange,
    handleStartOver,
    handleAddRecord,
    handleClose,
  } = useJobExtraction({ onSubmit, onClose });

  if (!isOpen) return null;

  const isLocked = step !== "input";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-150"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="job-extraction-modal relative w-full h-full max-w-360 rounded-xl bg-bg border border-line shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-job-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-2 border-b border-line shrink-0">
          <div>
            <h1 id="add-job-modal-title" className="text-base font-bold text-ink">
              Add Job Application
            </h1>
            <p className="text-[11px] text-muted">AI-assisted extraction — paste, review, save.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={step === "loading" || isSaving}
            title="Close"
            aria-label="Close add job dialog"
            className="h-8 w-8 bg-danger inline-flex items-center justify-center rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex min-h-0 flex-col sm:flex-row">
          <div className="w-full sm:w-[38%] lg:w-[34%] shrink-0 border-b sm:border-b-0 sm:border-r border-line p-4 sm:p-5 min-h-0 flex flex-col overflow-hidden">
            <ExtractJobForm
              sourceUrl={sourceUrl}
              rawJobText={rawJobText}
              onSourceUrlChange={setSourceUrl}
              onRawJobTextChange={setRawJobText}
              onExtract={handleExtract}
              isLoading={step === "loading"}
              isLocked={isLocked}
              errors={extractErrors}
              retryAfter={retryAfter}
            />
          </div>

          <div className="flex-1 min-h-0 bg-field/60 p-5 sm:p-6 overflow-y-auto">
            {step === "input" && <JobExtractionEmptyState />}
            {step === "loading" && <JobExtractionLoader />}
            {step === "review" && reviewData && (
              <JobReviewForm
                data={reviewData}
                onChange={handleReviewFieldChange}
                onSubmit={handleAddRecord}
                onStartOver={handleStartOver}
                isSubmitting={isSaving}
                error={saveError}
                urlWasCleaned={urlWasCleaned}
                inputUrl={sourceUrl}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
