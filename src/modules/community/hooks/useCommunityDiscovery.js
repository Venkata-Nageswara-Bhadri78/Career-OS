import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import {
  createCommunity,
  getJobCommunityPrefill,
  refineCommunityDescription,
  resolveCommunityUrls,
} from "../api/communityApi";
import { COMMUNITY_LIMITS, COMMUNITY_MATCH, COMMUNITY_MEMBERSHIP } from "../config/communityConstants";
import { COMMUNITY_ERROR_KINDS, classifyCommunityError, communityErrorText } from "../utils/communityErrors";
import {
  collectCommunityUrls,
  communityCreatePayload,
  emptyCommunityForm,
  formFromPrefill,
  mapServerFieldErrors,
  urlSignature,
  validateCommunityCreate,
  validateCommunityUrls,
} from "../utils/communityForm";
import { useCommunityAccount } from "./useCommunityAccount";

const BLOCKING = new Set([COMMUNITY_MATCH.MATCH_UNCERTAIN, COMMUNITY_MATCH.ALIAS_CONFLICT]);

function isAbort(error) {
  return error?.status === 499;
}

export function useCommunityDiscovery(jobId) {
  const navigate = useNavigate();
  const { refresh } = useCommunityAccount();
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState(null);
  const [mode, setMode] = useState("editor");
  const [form, setForm] = useState(emptyCommunityForm);
  const [summary, setSummary] = useState(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [refineNote, setRefineNote] = useState("");
  const [phase, setPhase] = useState("idle");
  const [canCreate, setCanCreate] = useState(false);
  const [fromForm, setFromForm] = useState(false);

  const formRef = useRef(form);
  const phaseRef = useRef("idle");
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const setBusy = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const replaceForm = (next) => {
    formRef.current = next;
    setForm(next);
  };

  const openRoom = (nextSummary, intent) => {
    if (nextSummary?.id == null) {
      setActionError("This community could not be opened.");
      return;
    }
    setActionError("");
    navigate(APP_PATHS.communityRoom(nextSummary.id), {
      state: { intent, summary: nextSummary },
    });
  };

  const applyMatch = (match, { reachedFromForm = false } = {}) => {
    const outcome = match?.outcome;
    if (outcome === COMMUNITY_MATCH.EXISTING_COMMUNITY && match.community) {
      setSummary(match.community);
      setNotice(match.message || "");
      setCanCreate(false);
      setFromForm(reachedFromForm);
      setMode("existing");
      return;
    }
    if (outcome === COMMUNITY_MATCH.NO_COMMUNITY) {
      setCanCreate(true);
      setNotice("");
      setMode("editor");
      return;
    }
    if (BLOCKING.has(outcome)) {
      setCanCreate(false);
      setNotice(match.message || "");
      setMode("editor");
      return;
    }
    console.warn("community match outcome unrecognized", { outcome });
    setCanCreate(false);
    setNotice("This posting could not be matched to a community.");
    setMode("editor");
  };

  const settleAuth = async (error) => {
    if (error?.kind !== COMMUNITY_ERROR_KINDS.ACCOUNT_REQUIRED && error?.kind !== COMMUNITY_ERROR_KINDS.TERMS_CHANGED) {
      return false;
    }
    await refreshRef.current();
    return true;
  };

  const load = useCallback(async (signal) => {
    setStatus("loading");
    setLoadError(null);
    try {
      const prefill = await getJobCommunityPrefill(jobId, { signal });
      if (signal?.aborted) return;
      const nextForm = formFromPrefill(prefill);
      formRef.current = nextForm;
      setForm(nextForm);
      setFieldErrors({});
      setFormError("");
      setRefineNote("");
      setFromForm(false);
      const outcome = prefill?.match?.outcome;
      if (outcome === COMMUNITY_MATCH.EXISTING_COMMUNITY && prefill.match.community) {
        setSummary(prefill.match.community);
        setNotice(prefill.match.message || "");
        setCanCreate(false);
        setMode("existing");
      } else if (outcome === COMMUNITY_MATCH.NO_COMMUNITY) {
        setSummary(null);
        setNotice("");
        setCanCreate(true);
        setMode("editor");
      } else if (BLOCKING.has(outcome)) {
        setSummary(null);
        setNotice(prefill.match?.message || "");
        setCanCreate(false);
        setMode("editor");
      } else {
        console.warn("community match outcome unrecognized", { outcome });
        setSummary(null);
        setNotice("This posting could not be matched to a community.");
        setCanCreate(false);
        setMode("editor");
      }
      setStatus("ready");
    } catch (error) {
      const classified = classifyCommunityError(error);
      if (signal?.aborted || isAbort(classified)) return;
      if (await settleAuth(classified)) return;
      setLoadError(classified);
      setStatus("error");
    }
  }, [jobId]);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    const frame = window.requestAnimationFrame(() => {
      void load(controller.signal);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
      requestIdRef.current += 1;
    };
  }, [load]);

  const invalidateInFlight = () => {
    if (phaseRef.current === "idle") return;
    requestIdRef.current += 1;
    abortRef.current?.abort();
    setBusy("idle");
  };

  const updateField = (name, value) => {
    if (name === "sourceUrl") invalidateInFlight();
    const next = { ...formRef.current, [name]: value };
    replaceForm(next);
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const copy = { ...current };
      delete copy[name];
      return copy;
    });
    setFormError("");
  };

  const updateAlternative = (index, value) => {
    invalidateInFlight();
    const alternativeUrls = formRef.current.alternativeUrls.slice();
    alternativeUrls[index] = value;
    replaceForm({ ...formRef.current, alternativeUrls });
    const key = `alternativeUrls[${index}]`;
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const copy = { ...current };
      delete copy[key];
      return copy;
    });
    setFormError("");
  };

  const addAlternative = () => {
    invalidateInFlight();
    replaceForm({
      ...formRef.current,
      alternativeUrls: [...formRef.current.alternativeUrls, ""],
    });
  };

  const removeAlternative = (index) => {
    invalidateInFlight();
    replaceForm({
      ...formRef.current,
      alternativeUrls: formRef.current.alternativeUrls.filter((_, item) => item !== index),
    });
    setFieldErrors({});
  };

  const failRequest = async (error, requestId) => {
    const classified = classifyCommunityError(error);
    if (isAbort(classified) || requestId !== requestIdRef.current) return;
    if (await settleAuth(classified)) return;
    if (BLOCKING.has(classified.kind)) {
      setCanCreate(false);
      setNotice(classified.message || "");
      setMode("editor");
      setFormError("");
      return;
    }
    setFieldErrors(mapServerFieldErrors(classified.fieldErrors));
    setFormError(communityErrorText(classified));
  };

  const resolveCurrent = async (controller) => {
    const signature = urlSignature(formRef.current);
    const match = await resolveCommunityUrls(
      { urls: collectCommunityUrls(formRef.current) },
      { signal: controller.signal }
    );
    if (controller.signal.aborted || urlSignature(formRef.current) !== signature) return null;
    return match;
  };

  const checkUrls = async () => {
    if (phaseRef.current !== "idle") return;
    const problems = validateCommunityUrls(formRef.current);
    setFieldErrors(problems);
    if (Object.keys(problems).length) return;
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy("resolving");
    setFormError("");
    try {
      const match = await resolveCurrent(controller);
      if (match == null || requestId !== requestIdRef.current) return;
      applyMatch(match, { reachedFromForm: true });
    } catch (error) {
      await failRequest(error, requestId);
    } finally {
      if (requestId === requestIdRef.current) setBusy("idle");
    }
  };

  const create = async () => {
    if (phaseRef.current !== "idle") return;
    const problems = validateCommunityCreate(formRef.current);
    setFieldErrors(problems);
    if (Object.keys(problems).length) return;
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy("resolving");
    setFormError("");
    try {
      const match = await resolveCurrent(controller);
      if (match == null || requestId !== requestIdRef.current) return;
      if (match.outcome !== COMMUNITY_MATCH.NO_COMMUNITY) {
        applyMatch(match, { reachedFromForm: true });
        return;
      }
      setBusy("creating");
      const result = await createCommunity(communityCreatePayload(jobId, formRef.current), {
        signal: controller.signal,
      });
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      if (result?.outcome === COMMUNITY_MATCH.CREATED) {
        openRoom(result.community, "open");
        return;
      }
      if (result?.outcome === COMMUNITY_MATCH.EXISTING_COMMUNITY) {
        if (!result.community) {
          setCanCreate(false);
          setFormError(result.message || "A community already exists for this posting.");
          return;
        }
        if (result.community.membership === COMMUNITY_MEMBERSHIP.MEMBER) {
          openRoom(result.community, "open");
          return;
        }
        setSummary(result.community);
        setNotice(result.message || "A community already exists for this posting.");
        setCanCreate(false);
        setFromForm(true);
        setMode("existing");
        return;
      }
      if (BLOCKING.has(result?.outcome)) {
        setCanCreate(false);
        setNotice(result.message || "");
        setMode("editor");
        return;
      }
      console.warn("community create outcome unrecognized", { outcome: result?.outcome });
      setFormError("This community could not be created.");
    } catch (error) {
      await failRequest(error, requestId);
    } finally {
      if (requestId === requestIdRef.current) setBusy("idle");
    }
  };

  const refine = async () => {
    if (phaseRef.current !== "idle") return;
    const sent = formRef.current.description;
    if (!String(sent).trim()) return;
    if (String(sent).trim().length > COMMUNITY_LIMITS.DESCRIPTION_MAX) {
      setFieldErrors((current) => ({ ...current, description: "Description cannot exceed 50000 characters." }));
      return;
    }
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy("refining");
    setRefineNote("");
    try {
      const result = await refineCommunityDescription({ description: String(sent).trim() }, { signal: controller.signal });
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      if (formRef.current.description !== sent) return;
      if (result?.refined) {
        replaceForm({ ...formRef.current, description: result.description ?? sent });
        setRefineNote("Review this wording before you create the community. You can edit it. It was not checked for facts.");
        return;
      }
      setRefineNote(result?.message || "The description could not be refined. The text you sent was kept.");
    } catch (error) {
      const classified = classifyCommunityError(error);
      if (isAbort(classified) || requestId !== requestIdRef.current) return;
      if (await settleAuth(classified)) return;
      setRefineNote(communityErrorText(classified));
    } finally {
      if (requestId === requestIdRef.current) setBusy("idle");
    }
  };

  return {
    status,
    loadError,
    mode,
    form,
    summary,
    notice,
    formError,
    actionError,
    fieldErrors,
    refineNote,
    phase,
    canCreate,
    fromForm,
    retry: () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      return load(controller.signal);
    },
    updateField,
    updateAlternative,
    addAlternative,
    removeAlternative,
    checkUrls,
    create,
    refine,
    editUrls: () => {
      setMode("editor");
      setCanCreate(false);
    },
    openSummary: () => openRoom(summary, "open"),
    joinSummary: () => openRoom(summary, "join"),
    cancel: () => navigate(APP_PATHS.DASHBOARD),
  };
}
