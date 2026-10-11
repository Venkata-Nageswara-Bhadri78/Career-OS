import { useCallback, useEffect, useRef, useState } from "react";
import { listResumes } from "../../user/api/userApi";
import jobExtractionApi from "../api/jobExtractionApi";
import {
  mapExtractionResult,
  mapJobExtractionError,
  mapPersistedExtraction,
  toJobRequest,
  validateExtractForm,
  validateReviewForm,
  wasUrlCanonicalized,
} from "../mappers/jobExtractionMapper";

const INITIAL_EXTRACT_ERRORS = { url: null, text: null, general: null, resume: null };

function selectedResumeId(resumeId) {
  const id = Number(resumeId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default function useJobExtraction({ isOpen = false, onSubmit, onClose, onJobPersisted }) {
  const [step, setStep] = useState("input");
  const [mode, setMode] = useState("manual");
  const [isAuto, setIsAuto] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawJobText, setRawJobText] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [resumes, setResumes] = useState([]);
  const [resumesError, setResumesError] = useState(null);
  const [extractErrors, setExtractErrors] = useState(INITIAL_EXTRACT_ERRORS);
  const [reviewData, setReviewData] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);
  const [urlWasCleaned, setUrlWasCleaned] = useState(false);
  const [autoNotice, setAutoNotice] = useState(null);
  const extractRequestId = useRef(0);
  const extractInFlight = useRef(false);
  const saveInFlight = useRef(false);

  const resetState = useCallback(() => {
    extractRequestId.current += 1;
    setStep("input");
    setMode("manual");
    setIsAuto(false);
    setSourceUrl("");
    setRawJobText("");
    setResumeId("");
    setExtractErrors(INITIAL_EXTRACT_ERRORS);
    setReviewData(null);
    setSaveError(null);
    setIsSaving(false);
    setRetryAfter(null);
    setUrlWasCleaned(false);
    setAutoNotice(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const controller = new AbortController();
    let active = true;

    listResumes({ signal: controller.signal })
      .then((list) => {
        if (!active) return;
        const rows = Array.isArray(list) ? list : [];
        setResumesError(null);
        setResumes(rows);
        setResumeId((current) => {
          if (selectedResumeId(current)) return current;
          const priority = rows.find((row) => row.highPriority);
          return priority?.id ?? rows[0]?.id ?? "";
        });
      })
      .catch((err) => {
        if (!active || err?.status === 499) return;
        setResumesError(err?.message || "Resumes could not be loaded. The priority resume will be used.");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (step === "loading" || isSaving) return;
    resetState();
    onClose?.();
  }, [isSaving, onClose, resetState, step]);

  const handleModeChange = useCallback(
    (nextMode) => {
      if (step !== "input") return;
      setMode(nextMode === "automated" ? "automated" : "manual");
      setExtractErrors(INITIAL_EXTRACT_ERRORS);
    },
    [step]
  );

  const applyExtractError = (err) => {
    const mapped = mapJobExtractionError(err);
    if (mapped.retryAfter) setRetryAfter(mapped.retryAfter);
    const urlError =
      mapped.fieldErrors.url ??
      (mapped.status === 400 && /url/i.test(mapped.message || "") ? mapped.message : null);
    const textError = mapped.fieldErrors.text ?? null;
    const resumeError = mapped.fieldErrors.resume ?? null;
    setExtractErrors({
      url: urlError,
      text: textError,
      resume: resumeError,
      general:
        mapped.fieldErrors.general ?? (urlError || textError || resumeError ? null : mapped.message),
    });
    setStep("input");
  };

  const handleExtract = useCallback(async () => {
    if (extractInFlight.current) return;
    setExtractErrors(INITIAL_EXTRACT_ERRORS);
    setRetryAfter(null);
    setAutoNotice(null);
    setSaveError(null);

    const clientErrors = validateExtractForm({ sourceUrl, rawJobText, mode });
    if (clientErrors.url || clientErrors.text) {
      setExtractErrors(clientErrors);
      return;
    }

    const requestId = ++extractRequestId.current;
    extractInFlight.current = true;
    setStep("loading");
    const resume = selectedResumeId(resumeId);

    try {
      const request = {
        sourceUrl: sourceUrl.trim(),
        resume,
        isAuto,
        ...(mode === "manual" ? { rawJobText: rawJobText.trim() } : {}),
      };
      const result =
        mode === "automated"
          ? await jobExtractionApi.extractJobFromUrl(request)
          : await jobExtractionApi.extractJobInfo(request);

      if (requestId !== extractRequestId.current) return;

      if (isAuto) {
        const persisted = mapPersistedExtraction(result);
        if (persisted.persistedAs === "JOB" && persisted.job?.id) {
          try {
            await onJobPersisted?.(persisted.job);
          } catch (err) {
            setExtractErrors({
              ...INITIAL_EXTRACT_ERRORS,
              general: err?.message || "The job was saved, but it could not be opened.",
            });
            setStep("input");
            return;
          }
          resetState();
          onClose?.();
          return;
        }
        if (persisted.persistedAs === "DRAFT" && persisted.draft?.id) {
          setAutoNotice({
            message: persisted.message || "Job could not be saved. Stored as a draft.",
            failureReason: persisted.failureReason || persisted.draft.failureReason || "",
            draftId: persisted.draft.id,
          });
          setStep("input");
          return;
        }
        setExtractErrors({
          ...INITIAL_EXTRACT_ERRORS,
          general: persisted.message || "The job could not be saved. No draft was confirmed.",
        });
        setStep("input");
        return;
      }

      const mapped = mapExtractionResult(result?.data);
      if (!mapped) {
        setExtractErrors({
          ...INITIAL_EXTRACT_ERRORS,
          general: result?.message || "The extraction response could not be read.",
        });
        setStep("input");
        return;
      }
      if (!mapped.resume && resume) mapped.resume = resume;
      setUrlWasCleaned(wasUrlCanonicalized(sourceUrl, mapped?.sourceUrl));
      setReviewData(mapped);
      setStep("review");
    } catch (err) {
      if (requestId !== extractRequestId.current) return;
      applyExtractError(err);
    } finally {
      extractInFlight.current = false;
    }
  }, [isAuto, mode, onClose, onJobPersisted, rawJobText, resetState, resumeId, sourceUrl]);

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
    if (!reviewData || isSaving || saveInFlight.current) return;
    saveInFlight.current = true;

    const validationErrors = validateReviewForm(reviewData);
    if (Object.keys(validationErrors).length > 0) {
      saveInFlight.current = false;
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
      saveInFlight.current = false;
      setIsSaving(false);
    }
  }, [isSaving, onClose, onSubmit, resetState, reviewData]);

  return {
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
    resetState,
  };
}
