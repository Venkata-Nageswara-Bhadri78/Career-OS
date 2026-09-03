import { useState } from "react";
import ExtractJobForm from "./ExtractJobForm";
import JobExtractionEmptyState from "./JobExtractionEmptyState";
import JobReviewForm from "./JobReviewForm";
import JobExtractionLoader from "../loaders/JobExtractionLoader";
import jobExtractionApi from "../../api/jobExtractionApi";

const INITIAL_EXTRACT_ERRORS = { url: null, text: null, general: null };

export default function AddJobModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState("input"); // "input" | "loading" | "review"
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawJobText, setRawJobText] = useState("");
  const [extractErrors, setExtractErrors] = useState(INITIAL_EXTRACT_ERRORS);
  const [reviewData, setReviewData] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetState = () => {
    setStep("input");
    setSourceUrl("");
    setRawJobText("");
    setExtractErrors(INITIAL_EXTRACT_ERRORS);
    setReviewData(null);
    setSaveError(null);
    setIsSaving(false);
  };

  const handleClose = () => {
    if (step === "loading" || isSaving) return;
    resetState();
    onClose();
  };

  const handleExtract = async () => {
    setExtractErrors(INITIAL_EXTRACT_ERRORS);
    setStep("loading");
    try {
      const result = await jobExtractionApi.extractJobInfo({
        sourceUrl: sourceUrl.trim(),
        rawJobText: rawJobText.trim(),
      });
      setReviewData(result);
      setStep("review");
    } catch (err) {
      const message = err?.message || "Failed to extract job info. Please try again.";
      const status = err?.status;

      if (status === 409) {
        setExtractErrors({ ...INITIAL_EXTRACT_ERRORS, general: message });
      } else if (status === 400) {
        if (/url/i.test(message)) {
          setExtractErrors({ ...INITIAL_EXTRACT_ERRORS, url: message });
        } else {
          setExtractErrors({ ...INITIAL_EXTRACT_ERRORS, text: message });
        }
      } else {
        setExtractErrors({ ...INITIAL_EXTRACT_ERRORS, general: message });
      }
      setStep("input");
    }
  };

  const handleReviewFieldChange = (key, value) => {
    setReviewData((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartOver = () => {
    setStep("input");
    setReviewData(null);
    setSaveError(null);
    setExtractErrors(INITIAL_EXTRACT_ERRORS);
  };

  const handleAddRecord = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      await onSubmit(reviewData);
      resetState();
      onClose();
    } catch (err) {
      setSaveError(err?.message || "Failed to save job. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isLocked = step !== "input";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full h-full max-w-360 rounded-xl bg-white border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-100 shrink-0">
          <div>
            <h1 className="text-base font-bold text-zinc-900">Add Job Application</h1>
            <p className="text-[11px] text-zinc-500">AI-assisted extraction — paste, review, save.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={step === "loading" || isSaving}
            title="Close"
            className="h-8 w-8 bg-red-500 inline-flex items-center justify-center rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Body: two panes */}
        <div className="flex-1 flex min-h-0 flex-col sm:flex-row">
          <div className="w-full sm:w-[38%] lg:w-[34%] shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-100 p-5 sm:p-6 min-h-0 flex flex-col">
            <ExtractJobForm
              sourceUrl={sourceUrl}
              rawJobText={rawJobText}
              onSourceUrlChange={setSourceUrl}
              onRawJobTextChange={setRawJobText}
              onExtract={handleExtract}
              isLoading={step === "loading"}
              isLocked={isLocked}
              errors={extractErrors}
            />
          </div>

          <div className="flex-1 min-h-0 bg-zinc-50/60 p-5 sm:p-6 overflow-hidden">
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
