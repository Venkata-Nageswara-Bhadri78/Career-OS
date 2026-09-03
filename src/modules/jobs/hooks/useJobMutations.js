import { useCallback, useRef, useState } from "react";
import jobApi from "../api/jobApi";
import { mergeJobSummary } from "../mappers/jobMapper";

export default function useJobFieldUpdate(onJobUpdated) {
  const [undoState, setUndoState] = useState(null);
  const undoTimerRef = useRef(null);

  const clearUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoState(null);
  }, []);

  const handleUpdate = useCallback(
    async (job, fieldKey, updateFn, newValue, label) => {
      const previousValue = job?.[fieldKey] ?? null;
      const updatedJob = await updateFn(job.id, newValue);
      const merged = mergeJobSummary(job, updatedJob);
      if (onJobUpdated) onJobUpdated(merged);

      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoState({
        jobId: job.id,
        fieldKey,
        previousValue,
        label,
        updateFn,
        job,
      });
      undoTimerRef.current = setTimeout(() => setUndoState(null), 5000);
    },
    [onJobUpdated]
  );

  const handleUndo = useCallback(async () => {
    if (!undoState) return;
    clearUndo();
    const { jobId, previousValue, updateFn, job } = undoState;
    const restoredJob = await updateFn(jobId, previousValue);
    const merged = mergeJobSummary(job, restoredJob);
    if (onJobUpdated) onJobUpdated(merged);
  }, [clearUndo, onJobUpdated, undoState]);

  return { handleUpdate, handleUndo, undoState, clearUndo };
}

export function useJobDelete() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteJob = useCallback(async (jobId) => {
    setIsDeleting(true);
    try {
      await jobApi.deleteJob(jobId);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteJob, isDeleting };
}

export function useJobCreate() {
  const [isCreating, setIsCreating] = useState(false);

  const createJob = useCallback(async (payload) => {
    setIsCreating(true);
    try {
      return await jobApi.createJob(payload);
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createJob, isCreating };
}
