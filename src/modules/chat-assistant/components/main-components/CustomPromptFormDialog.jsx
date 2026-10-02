import { useEffect, useId, useRef, useState } from "react";
import { CUSTOM_PROMPT_LIMITS } from "../../config/customPromptConfig";
import { validateCustomPromptFields } from "../../mappers/customPromptMapper";

export default function CustomPromptFormDialog({
  open,
  mode = "create",
  initialPrompt = null,
  busy = false,
  onSubmit,
  onClose,
}) {
  const titleId = useId();
  const titleFieldId = useId();
  const promptFieldId = useId();
  const titleRef = useRef(null);
  const formKey = open ? `${mode}:${initialPrompt?.id ?? "new"}:${initialPrompt?.updatedAt ?? ""}` : "closed";
  const [activeKey, setActiveKey] = useState(formKey);
  const [title, setTitle] = useState(initialPrompt?.title ?? "");
  const [prompt, setPrompt] = useState(initialPrompt?.prompt ?? "");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  if (formKey !== activeKey) {
    setActiveKey(formKey);
    setTitle(initialPrompt?.title ?? "");
    setPrompt(initialPrompt?.prompt ?? "");
    setFieldErrors({});
    setSubmitError("");
  }

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => titleRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [formKey, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose, open]);

  if (!open) return null;

  const isEdit = mode === "edit";
  const titleCount = title.length;
  const promptCount = prompt.length;
  const titleOver = titleCount > CUSTOM_PROMPT_LIMITS.TITLE_MAX;
  const promptOver = promptCount > CUSTOM_PROMPT_LIMITS.PROMPT_MAX;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCustomPromptFields(title, prompt);
    setFieldErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length) return;
    try {
      await onSubmit?.(title, prompt);
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose?.();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-base font-bold text-ink">
            {isEdit ? "Edit custom prompt" : "Create New Prompt"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg px-2 py-1 text-sm text-muted hover:text-ink disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {submitError ? (
            <p className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor={titleFieldId} className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id={titleFieldId}
              ref={titleRef}
              type="text"
              value={title}
              maxLength={CUSTOM_PROMPT_LIMITS.TITLE_MAX}
              disabled={busy}
              aria-invalid={Boolean(fieldErrors.title) || titleOver}
              onChange={(event) => {
                setTitle(event.target.value);
                if (fieldErrors.title) setFieldErrors((current) => ({ ...current, title: undefined }));
              }}
              className="h-10 w-full rounded-xl border border-line bg-field px-3.5 text-sm text-ink placeholder:text-muted/80 outline-none disabled:opacity-60"
              placeholder="Resume rewrite for this job"
            />
            <div className="flex items-start justify-between gap-3">
              {fieldErrors.title ? (
                <p className="text-[11px] text-danger" role="alert">
                  {fieldErrors.title}
                </p>
              ) : (
                <span />
              )}
              <span className={`text-[11px] ${titleOver ? "font-semibold text-danger" : "text-muted"}`}>
                {titleCount}/{CUSTOM_PROMPT_LIMITS.TITLE_MAX}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <label htmlFor={promptFieldId} className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink">
              Prompt <span className="text-danger">*</span>
            </label>
            <textarea
              id={promptFieldId}
              value={prompt}
              maxLength={CUSTOM_PROMPT_LIMITS.PROMPT_MAX}
              disabled={busy}
              rows={8}
              aria-invalid={Boolean(fieldErrors.prompt) || promptOver}
              onChange={(event) => {
                setPrompt(event.target.value);
                if (fieldErrors.prompt) setFieldErrors((current) => ({ ...current, prompt: undefined }));
              }}
              className="chat-assistant-scroll min-h-[10rem] w-full flex-1 resize-y rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm leading-relaxed text-ink placeholder:text-muted/80 outline-none disabled:opacity-60"
              placeholder="Rewrite my resume so it aligns strongly with this job description."
            />
            <div className="flex items-start justify-between gap-3">
              {fieldErrors.prompt ? (
                <p className="text-[11px] text-danger" role="alert">
                  {fieldErrors.prompt}
                </p>
              ) : (
                <span />
              )}
              <span className={`text-[11px] ${promptOver ? "font-semibold text-danger" : "text-muted"}`}>
                {promptCount}/{CUSTOM_PROMPT_LIMITS.PROMPT_MAX}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-9 rounded-xl border border-line px-3 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || titleOver || promptOver}
            className="h-9 rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create prompt"}
          </button>
        </div>
      </form>
    </div>
  );
}
