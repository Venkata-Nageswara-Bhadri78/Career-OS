import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import userApi from "../api/userApi";
import { PARSE_POLL_INTERVAL_MS, PARSE_POLL_MAX_ATTEMPTS, SUCCESS_TOAST_MS, USER_LIMITS } from "../config/userConfig";
import { buildProfileWriteBody, completenessScore, profileStats } from "../mappers/userMapper";
import {
  assertPdfMagicBytes,
  emptyToNull,
  formatApiError,
  openBlobPreview,
  triggerBlobDownload,
  validateResumeFile,
} from "../utils/formatters";

function isNotFound(err) {
  return err?.status === 404;
}

function isConflict(err) {
  return err?.status === 409;
}

export default function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [profileLoad, setProfileLoad] = useState("loading");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [parse, setParse] = useState({ status: "unknown", message: null, retryAfter: null });
  const [parseById, setParseById] = useState({});
  const [busy, setBusy] = useState("");

  const loadTokenRef = useRef(0);
  const loadAbortRef = useRef(null);
  const pollTimerRef = useRef(null);
  const successTimerRef = useRef(null);
  const pollAttemptsRef = useRef(0);
  const skipAutoCreateRef = useRef(false);
  const mountedRef = useRef(true);
  const prevParseStatusRef = useRef("unknown");
  const settleTimersRef = useRef({});

  const showToast = useCallback((message, tone = "success") => {
    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    setToast({ message, tone });
    successTimerRef.current = window.setTimeout(() => {
      setToast({ message: "", tone: "success" });
      successTimerRef.current = null;
    }, SUCCESS_TOAST_MS);
  }, []);

  const showSuccess = useCallback((message) => showToast(message, "success"), [showToast]);
  const showFailure = useCallback((message) => showToast(message, "danger"), [showToast]);

  const dismissSuccess = useCallback(() => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setToast({ message: "", tone: "success" });
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const stopParsePoll = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const rememberParse = useCallback((id, next) => {
    if (!id) return;
    setParseById((current) => ({ ...current, [id]: next }));
  }, []);

  const applyParse = useCallback((next) => {
    const status = next.status || "unknown";
    const previous = prevParseStatusRef.current;
    prevParseStatusRef.current = status;
    setParse({
      status,
      message: next.message || null,
      retryAfter: next.retryAfter ?? null,
    });
    if (status === "ready" && (previous === "pending" || previous === "rateLimited")) {
      showSuccess("Resume parsed successfully.");
    }
  }, [showSuccess]);

  const checkParseStatus = useCallback(
    async (signal) => {
      const result = await userApi.getResumeParseStatus({ signal });
      if (!mountedRef.current) return result;
      applyParse(result);
      return result;
    },
    [applyParse]
  );

  const startParsePoll = useCallback(() => {
    stopParsePoll();
    pollAttemptsRef.current = 0;
    applyParse({ status: "pending", message: "Your resume is still being processed.", retryAfter: null });

    const tick = async () => {
      if (!mountedRef.current) return;
      pollAttemptsRef.current += 1;
      const result = await checkParseStatus();
      const done = result.status === "ready" || result.status === "failed" || result.status === "missing";
      if (done || pollAttemptsRef.current >= PARSE_POLL_MAX_ATTEMPTS) return;
      const waitMs =
        result.status === "rateLimited" && result.retryAfter
          ? Math.max(PARSE_POLL_INTERVAL_MS, result.retryAfter * 1000)
          : PARSE_POLL_INTERVAL_MS;
      pollTimerRef.current = window.setTimeout(tick, waitMs);
    };

    tick();
  }, [applyParse, checkParseStatus, stopParsePoll]);

  const refreshResumes = useCallback(async (signal) => {
    const list = await userApi.listResumes({ signal });
    if (!mountedRef.current) return list;
    setResumes(list);
    setParseById((current) => {
      const next = { ...current };
      let changed = false;
      list.forEach((row) => {
        if (next[row.id]) return;
        next[row.id] = row.highPriority
          ? { status: "pending", message: "Your resume is still being processed.", retryAfter: null }
          : { status: "ready", message: null, retryAfter: null };
        changed = true;
      });
      return changed ? next : current;
    });
    return list;
  }, []);

  const loadFolder = useCallback(async () => {
    loadAbortRef.current?.abort();
    const token = ++loadTokenRef.current;
    const controller = new AbortController();
    loadAbortRef.current = controller;

    setProfileLoad("loading");
    setError("");

    try {
      let nextProfile;
      try {
        nextProfile = await userApi.getProfile({ signal: controller.signal });
      } catch (err) {
        if (isNotFound(err) && !skipAutoCreateRef.current) {
          try {
            nextProfile = await userApi.createProfile({}, { signal: controller.signal });
          } catch (createErr) {
            if (isConflict(createErr)) {
              nextProfile = await userApi.getProfile({ signal: controller.signal });
            } else {
              throw createErr;
            }
          }
        } else if (isNotFound(err)) {
          if (token !== loadTokenRef.current) return;
          setProfile(null);
          setResumes([]);
          setProfileLoad("missing");
          applyParse({ status: "missing", message: null, retryAfter: null });
          return;
        } else {
          throw err;
        }
      }

      let nextResumes = [];
      try {
        nextResumes = await userApi.listResumes({ signal: controller.signal });
      } catch (resumeErr) {
        if (!isNotFound(resumeErr)) throw resumeErr;
      }

      if (token !== loadTokenRef.current || !mountedRef.current) return;

      setProfile(nextProfile);
      setResumes(nextResumes);
      setParseById((current) => {
        const next = { ...current };
        nextResumes.forEach((row) => {
          if (next[row.id]) return;
          next[row.id] = row.highPriority
            ? { status: "pending", message: "Your resume is still being processed.", retryAfter: null }
            : { status: "ready", message: null, retryAfter: null };
        });
        return next;
      });
      setProfileLoad("ready");

      if (nextResumes.some((row) => row.highPriority)) {
        const result = await checkParseStatus(controller.signal);
        if (result.status === "pending" || result.status === "rateLimited") {
          startParsePoll();
        }
      } else {
        applyParse({ status: "missing", message: null, retryAfter: null });
      }
    } catch (err) {
      if (err?.status === 499) return;
      if (token !== loadTokenRef.current) return;
      setError(formatApiError(err, "Failed to load profile."));
      setProfileLoad(skipAutoCreateRef.current ? "missing" : "error");
    }
  }, [applyParse, checkParseStatus, startParsePoll]);

  useEffect(() => {
    mountedRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      loadFolder();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      mountedRef.current = false;
      loadTokenRef.current += 1;
      loadAbortRef.current?.abort();
      stopParsePoll();
      Object.values(settleTimersRef.current).forEach((timer) => window.clearTimeout(timer));
      settleTimersRef.current = {};
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    };
  }, [loadFolder, stopParsePoll]);

  useEffect(() => {
    const primaryId = resumes.find((row) => row.highPriority)?.id;
    if (!primaryId || parse.status === "unknown") return;
    rememberParse(primaryId, parse);
  }, [parse, rememberParse, resumes]);

  const createBlankProfile = useCallback(async () => {
    setBusy("create");
    setError("");
    try {
      skipAutoCreateRef.current = false;
      const created = await userApi.createProfile({});
      setProfile(created);
      setResumes([]);
      setProfileLoad("ready");
      applyParse({ status: "missing", message: null, retryAfter: null });
      showSuccess("Profile created successfully.");
    } catch (err) {
      if (isConflict(err)) {
        await loadFolder();
        return;
      }
      setError(formatApiError(err, "Failed to create profile."));
    } finally {
      setBusy("");
    }
  }, [applyParse, loadFolder, showSuccess]);

  const saveProfileCard = useCallback(
    async (fields) => {
      setBusy("profile");
      setError("");
      try {
        const updated = await userApi.updateProfile(buildProfileWriteBody(fields));
        setProfile(updated);
        showSuccess("Profile updated successfully.");
        return true;
      } catch (err) {
        setError(formatApiError(err, "Failed to save profile."));
        return false;
      } finally {
        setBusy("");
      }
    },
    [showSuccess]
  );

  const wipeProfile = useCallback(async () => {
    setBusy("wipe");
    setError("");
    try {
      await userApi.deleteProfile();
      skipAutoCreateRef.current = true;
      stopParsePoll();
      setProfile(null);
      setResumes([]);
      setProfileLoad("missing");
      applyParse({ status: "missing", message: null, retryAfter: null });
      showSuccess("Career folder deleted. Your account is still signed in.");
      return true;
    } catch (err) {
      setError(formatApiError(err, "Failed to delete profile."));
      return false;
    } finally {
      setBusy("");
    }
  }, [applyParse, showSuccess, stopParsePoll]);

  const refreshProfile = useCallback(async () => {
    const next = await userApi.getProfile();
    setProfile(next);
    return next;
  }, []);

  const runChildWrite = useCallback(
    async (action, successText) => {
      setError("");
      try {
        await action();
        await refreshProfile();
        showSuccess(successText);
        return { ok: true };
      } catch (err) {
        const message = formatApiError(err, "Unable to save that change.");
        setError(message);
        return { ok: false, message };
      }
    },
    [refreshProfile, showSuccess]
  );

  const addExperience = useCallback(
    (body) => runChildWrite(() => userApi.addExperience(body), "Work experience added."),
    [runChildWrite]
  );
  const updateExperience = useCallback(
    (id, body) => runChildWrite(() => userApi.updateExperience(id, body), "Work experience updated."),
    [runChildWrite]
  );
  const deleteExperience = useCallback(
    (id) => runChildWrite(() => userApi.deleteExperience(id), "Work experience deleted."),
    [runChildWrite]
  );

  const addEducation = useCallback(
    (body) => runChildWrite(() => userApi.addEducation(body), "Education added."),
    [runChildWrite]
  );
  const updateEducation = useCallback(
    (id, body) => runChildWrite(() => userApi.updateEducation(id, body), "Education updated."),
    [runChildWrite]
  );
  const deleteEducation = useCallback(
    (id) => runChildWrite(() => userApi.deleteEducation(id), "Education deleted."),
    [runChildWrite]
  );

  const addProject = useCallback(
    (body) =>
      runChildWrite(
        () =>
          userApi.addProject({
            projectTitle: body.projectTitle,
            projectDescription: emptyToNull(body.projectDescription),
            projectLink: emptyToNull(body.projectLink),
          }),
        "Project added."
      ),
    [runChildWrite]
  );
  const updateProject = useCallback(
    (id, body) =>
      runChildWrite(
        () =>
          userApi.updateProject(id, {
            projectTitle: body.projectTitle,
            projectDescription: emptyToNull(body.projectDescription),
            projectLink: emptyToNull(body.projectLink),
          }),
        "Project updated."
      ),
    [runChildWrite]
  );
  const deleteProject = useCallback(
    (id) => runChildWrite(() => userApi.deleteProject(id), "Project deleted."),
    [runChildWrite]
  );

  const addAdditionalInfo = useCallback(
    (body) =>
      runChildWrite(
        () =>
          userApi.addAdditionalInfo({
            type: body.type,
            description: emptyToNull(body.description),
            link: emptyToNull(body.link),
          }),
        "Additional information added."
      ),
    [runChildWrite]
  );
  const updateAdditionalInfo = useCallback(
    (id, body) =>
      runChildWrite(
        () =>
          userApi.updateAdditionalInfo(id, {
            type: body.type,
            description: emptyToNull(body.description),
            link: emptyToNull(body.link),
          }),
        "Additional information updated."
      ),
    [runChildWrite]
  );
  const deleteAdditionalInfo = useCallback(
    (id) => runChildWrite(() => userApi.deleteAdditionalInfo(id), "Additional information deleted."),
    [runChildWrite]
  );

  const addLink = useCallback(
    (body) => runChildWrite(() => userApi.addLink({ url: body.url.trim() }), "Profile link added."),
    [runChildWrite]
  );
  const updateLink = useCallback(
    (id, body) => runChildWrite(() => userApi.updateLink(id, { url: body.url.trim() }), "Profile link updated."),
    [runChildWrite]
  );
  const deleteLink = useCallback(
    (id) => runChildWrite(() => userApi.deleteLink(id), "Profile link deleted."),
    [runChildWrite]
  );

  const uploadResumeFile = useCallback(
    async (file) => {
      const localError = validateResumeFile(file);
      if (localError) {
        showFailure(localError);
        return false;
      }
      if (resumes.length >= USER_LIMITS.RESUME_CAP) {
        showFailure("Maximum resume limit reached : 10");
        return false;
      }
      setBusy("upload");
      setError("");
      try {
        await assertPdfMagicBytes(file);
        const uploaded = await userApi.uploadResume(file);
        const list = await refreshResumes();
        const newId = uploaded.resumeId;
        if (newId) {
          rememberParse(newId, {
            status: "pending",
            message: "Your resume is still being processed.",
            retryAfter: null,
          });
        }
        showSuccess("Resume uploaded successfully.");
        if (list.some((row) => row.highPriority)) startParsePoll();
        if (newId && !list.some((row) => row.id === newId && row.highPriority)) {
          if (settleTimersRef.current[newId]) window.clearTimeout(settleTimersRef.current[newId]);
          settleTimersRef.current[newId] = window.setTimeout(() => {
            if (!mountedRef.current) return;
            setParseById((current) => {
              if (current[newId]?.status !== "pending") return current;
              return { ...current, [newId]: { status: "ready", message: null, retryAfter: null } };
            });
          }, PARSE_POLL_INTERVAL_MS * 3);
        }
        return true;
      } catch (err) {
        showFailure(formatApiError(err, err?.message || "Failed to upload resume."));
        return false;
      } finally {
        setBusy("");
      }
    },
    [refreshResumes, rememberParse, resumes.length, showFailure, showSuccess, startParsePoll]
  );

  const removeResume = useCallback(
    async (id) => {
      setBusy(`resume-delete-${id}`);
      setError("");
      try {
        await userApi.deleteResume(id);
        if (settleTimersRef.current[id]) {
          window.clearTimeout(settleTimersRef.current[id]);
          delete settleTimersRef.current[id];
        }
        setParseById((current) => {
          if (!current[id]) return current;
          const next = { ...current };
          delete next[id];
          return next;
        });
        const list = await refreshResumes();
        showSuccess("Resume deleted successfully.");
        if (list.some((row) => row.highPriority)) {
          startParsePoll();
        } else {
          stopParsePoll();
          applyParse({ status: "missing", message: null, retryAfter: null });
        }
        return true;
      } catch (err) {
        showFailure(formatApiError(err, "Failed to delete resume."));
        return false;
      } finally {
        setBusy("");
      }
    },
    [applyParse, refreshResumes, showFailure, showSuccess, startParsePoll, stopParsePoll]
  );

  const markPrimaryResume = useCallback(
    async (id) => {
      setBusy(`resume-primary-${id}`);
      setError("");
      try {
        await userApi.setPrimaryResume(id);
        await refreshResumes();
        showSuccess("Primary resume updated.");
        startParsePoll();
        return true;
      } catch (err) {
        setError(formatApiError(err, "Failed to set primary resume."));
        return false;
      } finally {
        setBusy("");
      }
    },
    [refreshResumes, showSuccess, startParsePoll]
  );

  const downloadResumeFile = useCallback(async (id) => {
    setError("");
    try {
      const { blob, filename } = await userApi.downloadResume(id);
      triggerBlobDownload(blob, filename);
      return true;
    } catch (err) {
      setError(formatApiError(err, "Failed to download resume."));
      return false;
    }
  }, []);

  const previewResumeFile = useCallback(async (id) => {
    setError("");
    try {
      const { blob } = await userApi.downloadResume(id);
      const opened = openBlobPreview(blob);
      if (!opened) setError("Allow pop-ups to preview the resume, or use Download instead.");
      return opened;
    } catch (err) {
      setError(formatApiError(err, "Failed to open resume."));
      return false;
    }
  }, []);

  const completeness = useMemo(() => completenessScore(profile, resumes.length), [profile, resumes.length]);
  const stats = useMemo(() => profileStats(profile), [profile]);
  const primaryResumeId = useMemo(() => resumes.find((row) => row.highPriority)?.id ?? null, [resumes]);

  return {
    profile,
    resumes,
    profileLoad,
    hasProfile: Boolean(profile),
    error,
    successMessage: toast.message,
    toastTone: toast.tone,
    parse,
    parseById,
    busy,
    completeness,
    stats,
    primaryResumeId,
    clearError,
    dismissSuccess,
    reload: loadFolder,
    createBlankProfile,
    saveProfileCard,
    wipeProfile,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addProject,
    updateProject,
    deleteProject,
    addAdditionalInfo,
    updateAdditionalInfo,
    deleteAdditionalInfo,
    addLink,
    updateLink,
    deleteLink,
    uploadResumeFile,
    removeResume,
    markPrimaryResume,
    downloadResumeFile,
    previewResumeFile,
  };
}
