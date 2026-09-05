import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAiMetadata, getResumeContextStatus, listSavedJobsForContext } from "../api/aiApi";
import { DEFAULT_AI_MODE, RESUME_POLL_INTERVAL_MS } from "../config/aiConfig";
import { asPositiveInt, normalizeMode, validatePaste, validateTemperature } from "../mappers/aiMapper";

export default function useAiGrounding() {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = asPositiveInt(searchParams.get("jobId"));

  const [mode, setMode] = useState(DEFAULT_AI_MODE);
  const [customResumeText, setCustomResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [resume, setResume] = useState({ status: "idle", message: null, retryAfter: null });
  const [jobs, setJobs] = useState([]);
  const [jobsError, setJobsError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const resumePollRef = useRef(null);
  const resumeRequestRef = useRef(0);

  const refreshResume = useCallback(async () => {
    const requestId = ++resumeRequestRef.current;
    const result = await getResumeContextStatus();
    if (requestId !== resumeRequestRef.current) return result;
    setResume(result);
    return result;
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const meta = await getAiMetadata();
        if (!ignore) setMetadata(meta);
      } catch {
        if (!ignore) setMetadata(null);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setIsLoadingJobs(true);
        const rows = await listSavedJobsForContext();
        if (!ignore) {
          setJobs(rows);
          setJobsError(null);
        }
      } catch {
        if (!ignore) {
          setJobs([]);
          setJobsError("Saved jobs could not be loaded. You can still paste a job description.");
        }
      } finally {
        if (!ignore) setIsLoadingJobs(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    refreshResume();
    return () => {
      resumeRequestRef.current += 1;
    };
  }, [refreshResume]);

  useEffect(() => {
    if (resumePollRef.current) {
      clearInterval(resumePollRef.current);
      resumePollRef.current = null;
    }
    if (resume.status !== "pending" && resume.status !== "rateLimited") return undefined;

    const delay =
      resume.status === "rateLimited" && resume.retryAfter
        ? Math.max(RESUME_POLL_INTERVAL_MS, resume.retryAfter * 1000)
        : RESUME_POLL_INTERVAL_MS;

    resumePollRef.current = window.setInterval(() => {
      refreshResume();
    }, delay);

    return () => {
      if (resumePollRef.current) {
        clearInterval(resumePollRef.current);
        resumePollRef.current = null;
      }
    };
  }, [resume.status, resume.retryAfter, refreshResume]);

  const selectJobId = useCallback(
    (nextId) => {
      const parsed = asPositiveInt(nextId);
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (parsed) next.set("jobId", String(parsed));
          else next.delete("jobId");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resumePasteError = validatePaste(customResumeText, "Resume text");
  const jobPasteError = validatePaste(jobDescription, "Job description");
  const temperatureError = validateTemperature(temperature);
  const usingCustomResume = Boolean(customResumeText.trim());
  const usingPastedJob = Boolean(jobDescription.trim());
  const selectedJob = jobs.find((job) => job.id === jobId) || null;

  const resumeBlocksSend = !usingCustomResume && (resume.status === "pending" || resume.status === "failed");

  return {
    mode,
    setMode: (next) => setMode(normalizeMode(next)),
    customResumeText,
    setCustomResumeText,
    jobDescription,
    setJobDescription,
    jobId,
    selectJobId,
    selectedJob,
    temperature,
    setTemperature,
    resume,
    refreshResume,
    jobs,
    jobsError,
    isLoadingJobs,
    metadata,
    resumePasteError,
    jobPasteError,
    temperatureError,
    usingCustomResume,
    usingPastedJob,
    resumeBlocksSend,
  };
}
