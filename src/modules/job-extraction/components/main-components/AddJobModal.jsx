import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import ExtractJobForm from "./ExtractJobForm";
import JobExtractionEmptyState from "./JobExtractionEmptyState";
import JobReviewForm from "./JobReviewForm";
import JobExtractionLoader from "../loaders/JobExtractionLoader";
import useJobExtraction from "../../hooks/useJobExtraction";
import "../../styles/jobExtraction.css";

function DraftNotice({ notice, onOpenDraft }) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col justify-center px-4">
      <h3 className="text-lg font-bold text-ink">Stored as a draft</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted" role="status">
        {notice.message}
      </p>
      {notice.failureReason ? (
        <p className="mt-3 rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink">{notice.failureReason}</p>
      ) : null}
      <button
        type="button"
        onClick={() => onOpenDraft(notice.draftId)}
        className="mt-4 inline-flex w-fit items-center rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white"
      >
        Open draft
      </button>
    </div>
  );
}

export default function AddJobModal({ isOpen, onClose, onSubmit, onJobPersisted, onOpenDraft }) {
  const navigate = useNavigate();
  const {
    step,
    mode,
    isAuto,
    sourceUrl,
    rawJobText,
    resumeId,
    resumes,
    resumesError,
    extractErrors,
    reviewData,
    saveError,
    isSaving,
    retryAfter,
    urlWasCleaned,
    autoNotice,
    setSourceUrl,
    setRawJobText,
    setResumeId,
    setIsAuto,
    handleModeChange,
    handleExtract,
    handleReviewFieldChange,
    handleStartOver,
    handleAddRecord,
    handleClose,
  } = useJobExtraction({ isOpen, onSubmit, onClose, onJobPersisted });

  if (!isOpen) return null;

  const isLocked = step !== "input";

  const openDraft = (draftId) => {
    handleClose();
    if (onOpenDraft) onOpenDraft(draftId);
    else navigate(`${APP_PATHS.JOB_DRAFTS}/${draftId}`);
  };

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
            <p className="text-[11px] text-muted">Choose how to add a job to your tracker.</p>
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
              mode={mode}
              isAuto={isAuto}
              sourceUrl={sourceUrl}
              rawJobText={rawJobText}
              resumeId={resumeId}
              resumes={resumes}
              resumesError={resumesError}
              onModeChange={handleModeChange}
              onSourceUrlChange={setSourceUrl}
              onRawJobTextChange={setRawJobText}
              onResumeChange={setResumeId}
              onAutoChange={setIsAuto}
              onExtract={handleExtract}
              isLoading={step === "loading"}
              isLocked={isLocked}
              errors={extractErrors}
              retryAfter={retryAfter}
            />
          </div>

          <div className="flex-1 min-h-0 bg-field/60 p-5 sm:p-6 overflow-y-auto">
            {step === "input" && autoNotice?.draftId ? (
              <DraftNotice notice={autoNotice} onOpenDraft={openDraft} />
            ) : null}
            {step === "input" && !autoNotice?.draftId ? (
              <JobExtractionEmptyState mode={mode} isAuto={isAuto} />
            ) : null}
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
