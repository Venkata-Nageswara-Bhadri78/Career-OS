import { useCallback, useRef, useState } from "react";
import jobExtractionApi from "../api/jobExtractionApi";
import {
  mapExtractionResult,
  mapJobExtractionError,
  toJobRequest,
  validateExtractForm,
  validateReviewForm,
  wasUrlCanonicalized,
} from "../mappers/jobExtractionMapper";

const INITIAL_EXTRACT_ERRORS = { url: null, text: null, general: null };

export default function useJobExtraction({ onSubmit, onClose }) {
  const [step, setStep] = useState("input");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawJobText, setRawJobText] = useState("");
  const [extractErrors, setExtractErrors] = useState(INITIAL_EXTRACT_ERRORS);
  const [reviewData, setReviewData] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);
  const [urlWasCleaned, setUrlWasCleaned] = useState(false);
  const extractRequestId = useRef(0);

  const resetState = useCallback(() => {
    setStep("input");
    setSourceUrl("");
    setRawJobText("");
    setExtractErrors(INITIAL_EXTRACT_ERRORS);
    setReviewData(null);
    setSaveError(null);
    setIsSaving(false);
    setRetryAfter(null);
    setUrlWasCleaned(false);
  }, []);

  const handleClose = useCallback(() => {
    if (step === "loading" || isSaving) return;
    resetState();
    onClose?.();
  }, [step, isSaving, resetState, onClose]);

  const handleExtract = useCallback(async () => {
    setExtractErrors(INITIAL_EXTRACT_ERRORS);
    setRetryAfter(null);

    const clientErrors = validateExtractForm({ sourceUrl, rawJobText });
    if (clientErrors.url || clientErrors.text) {
      setExtractErrors(clientErrors);
      return;
    }

    const requestId = ++extractRequestId.current;
    setStep("loading");

    try {
      const result = await jobExtractionApi.extractJobInfo({
        sourceUrl: sourceUrl.trim(),
        rawJobText: rawJobText.trim(),
      });

      if (requestId !== extractRequestId.current) return;

      const mapped = mapExtractionResult(result);
      setUrlWasCleaned(wasUrlCanonicalized(sourceUrl, mapped?.sourceUrl));
      setReviewData(mapped);
      setStep("review");
    } catch (err) {
      if (requestId !== extractRequestId.current) return;

      const mapped = mapJobExtractionError(err);
      if (mapped.retryAfter) setRetryAfter(mapped.retryAfter);

      if (mapped.fieldErrors.url || mapped.fieldErrors.text) {
        setExtractErrors({
          url: mapped.fieldErrors.url ?? null,
          text: mapped.fieldErrors.text ?? null,
          general: mapped.fieldErrors.general ?? null,
        });
      } else if (mapped.status === 400 && /url/i.test(mapped.message || "")) {
        setExtractErrors({ ...INITIAL_EXTRACT_ERRORS, url: mapped.message });
      } else if (mapped.status === 400 && mapped.message) {
        setExtractErrors({ ...INITIAL_EXTRACT_ERRORS, text: mapped.message });
      } else {
        setExtractErrors({ ...INITIAL_EXTRACT_ERRORS, general: mapped.message });
      }
      setStep("input");
    }
  }, [sourceUrl, rawJobText]);

  const handleReviewFieldChange = useCallback((key, value) => {
    setReviewData((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaveError(null);
  }, []);

  const handleStartOver = useCallback(() => {
    setStep("input");
    setReviewData(null);
    setSaveError(null);
    setUrlWasCleaned(false);
    setExtractErrors(INITIAL_EXTRACT_ERRORS);
  }, []);

  const handleAddRecord = useCallback(async () => {
    if (!reviewData) return;

    const validationErrors = validateReviewForm(reviewData);
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors).find(Boolean);
      setSaveError(firstError || "Please fix the highlighted fields before saving.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      const payload = toJobRequest(reviewData);
      await onSubmit?.(payload);
      resetState();
      onClose?.();
    } catch (err) {
      const mapped = mapJobExtractionError(err);
      if (mapped.retryAfter) setRetryAfter(mapped.retryAfter);
      setSaveError(mapped.message || "Failed to save job. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [reviewData, onSubmit, resetState, onClose]);

  return {
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
    resetState,
  };
}
