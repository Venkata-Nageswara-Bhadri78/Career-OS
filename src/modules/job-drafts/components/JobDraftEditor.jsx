import { useEffect, useRef, useState } from "react";
import Spinner from "../../../common/components/loaders/Spinner";
import SkillsTagEditor from "../../job-extraction/components/main-components/SkillsTagEditor";
import { listResumes } from "../../user/api/userApi";
import { splitJobSkills, joinJobSkills } from "../../jobs/utils/formatters";
import ResumeMatchScore from "../../jobs/components/common/ResumeMatchScore";
import jobDraftApi from "../api/jobDraftApi";
import {
  draftFailureText,
  draftToForm,
  missingDraftFields,
  parseDraftFieldErrors,
  scoreInputError,
  toDraftUpdateRequest,
} from "../mappers/jobDraftMapper";
import DeleteDraftDialog from "./DeleteDraftDialog";

const inputClass =
  "w-full rounded-lg border border-line bg-field px-3 py-2 text-xs text-ink placeholder:text-muted/70 focus:border-ink focus:bg-white focus:outline-none";

function Field({ label, required = false, error, missing = false, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <div className={missing ? "rounded-lg ring-1 ring-accent" : undefined}>{children}</div>
      {error ? <span className="block text-[11px] font-medium text-danger">{error}</span> : null}
      {missing && !error ? (
        <span className="block text-[11px] font-medium text-accent">Required before this draft can become a job.</span>
      ) : null}
    </label>
  );
}

export default function JobDraftEditor({ draftId, isOpen, onClose, onUpdated, onDeleted, onSavedJob }) {
  const [draft, setDraft] = useState(null);
  const [form, setForm] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loadedId, setLoadedId] = useState(null);
  const [failure, setFailure] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [busy, setBusy] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !draftId) return undefined;
    const controller = new AbortController();
    let active = true;

    Promise.all([
      jobDraftApi.getJobDraft(draftId, { signal: controller.signal }),
      listResumes({ signal: controller.signal }).catch(() => []),
    ])
      .then(([nextDraft, nextResumes]) => {
        if (!active) return;
        setDraft(nextDraft);
        setForm(draftToForm(nextDraft));
        setResumes(Array.isArray(nextResumes) ? nextResumes : []);
        setFailure(null);
        setLoadedId(draftId);
      })
      .catch((err) => {
        if (!active || err?.status === 499) return;
        setDraft(null);
        setForm(null);
        setLoadedId(draftId);
        setFailure({
          draftId,
          unavailable: err?.status === 404,
          message: err?.message || (err?.status === 404 ? "This draft is unavailable." : "Unable to load this draft."),
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [draftId, isOpen, retryKey]);

  if (!isOpen) return null;

  const missing = form ? missingDraftFields(form) : {};
  const scoreError = form ? scoreInputError(form.resumeToJobScore) : null;
  const locked = Boolean(busy);

  const setField = (key, value) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  };

  const applyFailure = (err) => {
    const message = err?.message || "The draft could not be updated.";
    if (err?.status === 404 && /draft/i.test(message)) {
      setForm(null);
      setLoadedId(draftId);
      setFailure({ draftId, unavailable: true, message });
      return;
    }
    setFieldErrors(parseDraftFieldErrors(message));
    setFormError(message);
  };

  const handleUpdate = async () => {
    if (!form || locked || busyRef.current) return;
    if (scoreError) {
      setFieldErrors((prev) => ({ ...prev, resumeToJobScore: scoreError }));
      return;
    }
    busyRef.current = true;
    setBusy("update");
    setFormError(null);
    try {
      const updated = await jobDraftApi.updateJobDraft(draftId, toDraftUpdateRequest(form));
      setDraft(updated);
      setForm(draftToForm(updated));
      setNotice("Draft saved.");
      onUpdated?.(updated);
    } catch (err) {
      applyFailure(err);
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const handleSaveJob = async () => {
    if (!form || locked || busyRef.current) return;
    if (scoreError || Object.values(missing).some(Boolean)) {
      setFieldErrors((prev) => ({ ...prev, resumeToJobScore: scoreError || prev.resumeToJobScore }));
      setFormError("Fill the required fields before adding this draft to Jobs.");
      return;
    }
    busyRef.current = true;
    setBusy("save");
    setFormError(null);
    try {
      const updated = await jobDraftApi.updateJobDraft(draftId, toDraftUpdateRequest(form));
      setDraft(updated);
      setForm(draftToForm(updated));
      onUpdated?.(updated);
      const job = await jobDraftApi.saveJobDraft(draftId);
      if (!job?.id) {
        setFormError("The job was not confirmed. This draft is still here.");
        return;
      }
      onDeleted?.(draftId);
      onSavedJob?.(job);
    } catch (err) {
      applyFailure(err);
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (locked || busyRef.current) return;
    busyRef.current = true;
    setBusy("delete");
    setFormError(null);
    try {
      await jobDraftApi.deleteJobDraft(draftId);
      setConfirmDelete(false);
      onDeleted?.(draftId);
      onClose();
    } catch (err) {
      setConfirmDelete(false);
      if (err?.status === 404) {
        onDeleted?.(draftId);
        setForm(null);
        setLoadedId(draftId);
        setFailure({
          draftId,
          unavailable: true,
          message: err.message || "This draft is unavailable.",
        });
        return;
      }
      applyFailure(err);
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const activeFailure = failure?.draftId === draftId ? failure : null;
  const isCurrent = loadedId === draftId && !activeFailure;
  const isLoading = Boolean(draftId && !isCurrent && !activeFailure);
  const loadError = activeFailure?.message ?? null;
  const unavailable = Boolean(activeFailure?.unavailable);
  const editorForm = isCurrent ? form : null;
  const editorDraft = isCurrent ? draft : null;
  const knownResume = resumes.some((row) => row.id === editorForm?.resume);
  const failureReason = draftFailureText(editorDraft);

  return (
    <div className="fixed inset-0 z-50 bg-ink/40">
      <button type="button" className="absolute inset-0" aria-label="Close draft editor" onClick={() => !locked && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-draft-editor-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 id="job-draft-editor-title" className="text-lg font-bold text-ink">
              Review draft
            </h2>
            <p className="mt-0.5 text-xs text-muted">Finish the missing fields, then add it to Jobs.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close draft editor"
            className="grid h-8 w-8 place-items-center rounded-full bg-danger text-white disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex items-center gap-2 py-10 text-xs text-muted">
              <Spinner className="h-4 w-4 text-ink" />
              Loading draft…
            </div>
          ) : null}

          {loadError ? (
            <div className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger" role="alert">
              <p>{loadError}</p>
              {unavailable ? (
                <button type="button" onClick={onClose} className="mt-2 font-semibold text-ink">
                  Back to drafts
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setFailure(null);
                    setLoadedId(null);
                    setRetryKey((value) => value + 1);
                  }}
                  className="mt-2 font-semibold text-ink"
                >
                  Retry
                </button>
              )}
            </div>
          ) : null}

          {editorForm ? (
            <div className="space-y-3">
              {failureReason ? (
                <p className="rounded-xl border border-line bg-field px-3 py-2 text-xs text-ink" role="status">
                  {failureReason}
                </p>
              ) : null}
              {notice ? (
                <p className="rounded-xl border border-success/20 bg-success/5 px-3 py-2 text-xs text-success" role="status">
                  {notice}
                </p>
              ) : null}
              {formError ? (
                <p className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger" role="alert">
                  {formError}
                </p>
              ) : null}

              <Field label="Job posting URL" required missing={missing.sourceUrl} error={fieldErrors.sourceUrl}>
                <input
                  value={form.sourceUrl}
                  onChange={(event) => setField("sourceUrl", event.target.value)}
                  disabled={locked}
                  inputMode="url"
                  className={inputClass}
                />
              </Field>
              <Field
                label="Original description"
                required
                missing={missing.originalDescription}
                error={fieldErrors.originalDescription}
              >
                <textarea
                  value={form.originalDescription}
                  onChange={(event) => setField("originalDescription", event.target.value)}
                  disabled={locked}
                  rows={5}
                  className={inputClass}
                />
              </Field>
              <Field label="Job title" required missing={missing.title} error={fieldErrors.title}>
                <input
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  disabled={locked}
                  className={inputClass}
                />
              </Field>
              <Field label="Company" required missing={missing.company} error={fieldErrors.company}>
                <input
                  value={form.company}
                  onChange={(event) => setField("company", event.target.value)}
                  disabled={locked}
                  className={inputClass}
                />
              </Field>

              {[
                ["location", "Location"],
                ["workMode", "Work mode"],
                ["employmentType", "Employment type"],
                ["experience", "Experience"],
                ["salary", "Salary"],
                ["education", "Education"],
                ["department", "Department"],
                ["industry", "Industry"],
                ["sourcePlatform", "Source platform"],
              ].map(([key, label]) => (
                <Field key={key} label={label} error={fieldErrors[key]}>
                  <input
                    value={form[key]}
                    onChange={(event) => setField(key, event.target.value)}
                    disabled={locked}
                    className={inputClass}
                  />
                </Field>
              ))}

              <Field label="Description" error={fieldErrors.description}>
                <textarea
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  disabled={locked}
                  rows={4}
                  className={inputClass}
                />
              </Field>
              <Field label="Skills" error={fieldErrors.skills}>
                <SkillsTagEditor
                  skills={splitJobSkills(form.skills)}
                  onChange={(chips) => setField("skills", joinJobSkills(chips))}
                />
              </Field>
              <Field label="Resume" error={fieldErrors.resume}>
                <select
                  value={form.resume || ""}
                  onChange={(event) => setField("resume", event.target.value ? Number(event.target.value) : "")}
                  disabled={locked}
                  className={inputClass}
                >
                  <option value="">No resume</option>
                  {!knownResume && form.resume ? <option value={form.resume}>Saved resume</option> : null}
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.originalFilename}
                      {resume.highPriority ? " (Priority)" : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Match score" error={fieldErrors.resumeToJobScore || scoreError}>
                <div className="flex items-center gap-2">
                  <input
                    value={form.resumeToJobScore}
                    onChange={(event) => setField("resumeToJobScore", event.target.value)}
                    disabled={locked}
                    inputMode="numeric"
                    className={inputClass}
                  />
                  <ResumeMatchScore score={form.resumeToJobScore} compact />
                </div>
              </Field>
            </div>
          ) : null}
        </div>

        {editorForm ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={locked}
              className="text-xs font-semibold text-danger disabled:opacity-50"
            >
              Delete draft
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={locked}
                className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink disabled:opacity-50"
              >
                {busy === "update" ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                onClick={handleSaveJob}
                disabled={locked}
                className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {busy === "save" ? "Adding…" : "Add to Jobs"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <DeleteDraftDialog
        isOpen={confirmDelete}
        busy={busy === "delete"}
        onClose={() => !locked && setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
