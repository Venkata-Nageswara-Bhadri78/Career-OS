import { useCallback, useEffect, useRef, useState } from "react";
import jobApi from "../../jobs/api/jobApi";
import { isValidJobId } from "../mappers/chatAssistantMapper";

export default function useChatJob(jobId) {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(() => isValidJobId(jobId));
  const requestIdRef = useRef(0);

  const loadJob = useCallback(async () => {
    if (!isValidJobId(jobId)) {
      setJob(null);
      setIsLoading(false);
      return;
    }
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const data = await jobApi.getJobById(jobId);
      if (requestId !== requestIdRef.current) return;
      setJob(data);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setJob(null);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      loadJob();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      requestIdRef.current += 1;
    };
  }, [loadJob]);

  return { job, isLoading, setJob };
}
