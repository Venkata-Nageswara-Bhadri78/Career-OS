import { COMMUNITY_LIMITS } from "../../config/communityConstants";
import { isAbsoluteHttpUrl, validateCommunityCreate, validateCommunityUrls } from "../../utils/communityForm";

const MAX_ALTERNATIVES = COMMUNITY_LIMITS.RESOLVE_URL_MAX - 1;

function Field({ id, label, hint, error, children }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <p id={hintId} className="mt-1 text-xs leading-5 text-muted">
        {hint}
      </p>
      <div className="mt-2">{children(error ? errorId : undefined, hintId)}</div>
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-danger break-words">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full min-w-0 rounded-lg border border-line bg-field px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:bg-white";

function liveErrors(form) {
  const errors = {};
  if (String(form.title ?? "").trim().length > COMMUNITY_LIMITS.TITLE_MAX) {
    errors.title = "Title cannot exceed 255 characters.";
  }
  if (String(form.company ?? "").trim().length > COMMUNITY_LIMITS.COMPANY_MAX) {
    errors.company = "Company cannot exceed 255 characters.";
  }
  if (String(form.location ?? "").trim().length > COMMUNITY_LIMITS.LOCATION_MAX) {
    errors.location = "Location cannot exceed 255 characters.";
  }
  if (String(form.description ?? "").trim().length > COMMUNITY_LIMITS.DESCRIPTION_MAX) {
    errors.description = "Description cannot exceed 50000 characters.";
  }
  const source = String(form.sourceUrl ?? "").trim();
  if (source.length > COMMUNITY_LIMITS.URL_MAX) errors.sourceUrl = "Posting URL cannot exceed 2000 characters.";
  else if (source && !isAbsoluteHttpUrl(source)) errors.sourceUrl = "Job URL must be a valid absolute http or https link.";
  (form.alternativeUrls ?? []).forEach((url, index) => {
    const text = String(url ?? "").trim();
    if (!text) {
      errors[`alternativeUrls[${index}]`] = "Alternative posting URL cannot be blank.";
      return;
    }
    if (text.length > COMMUNITY_LIMITS.URL_MAX) {
      errors[`alternativeUrls[${index}]`] = "Posting URL cannot exceed 2000 characters.";
    } else if (!isAbsoluteHttpUrl(text)) {
      errors[`alternativeUrls[${index}]`] = "Job URL must be a valid absolute http or https link.";
    }
  });
  return errors;
}

function primaryLabel(phase, canCreate) {
  if (phase === "creating") return "Creating…";
  if (phase === "resolving") return "Checking URLs…";
  return canCreate ? "Create Community" : "Check URLs";
}

export default function CommunityCreateForm({
  form,
  fieldErrors,
  formError,
  notice,
  refineNote,
  phase,
  canCreate,
  onField,
  onAlternative,
  onAddAlternative,
  onRemoveAlternative,
  onCreate,
  onCheckUrls,
  onRefine,
  onCancel,
}) {
  const shown = { ...liveErrors(form), ...fieldErrors };
  const urlProblems = validateCommunityUrls(form);
  const createProblems = validateCommunityCreate(form);
  const busy = phase !== "idle";
  const primaryDisabled = busy || (canCreate ? Object.keys(createProblems).length > 0 : Object.keys(urlProblems).length > 0);
  const alternatives = Array.isArray(form.alternativeUrls) ? form.alternativeUrls : [];

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Open job community</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        A community is the shared chat for one posting. Nothing is created until you choose Create Community.
      </p>

      {notice ? (
        <p className="mt-4 rounded-xl border border-line bg-field px-4 py-3 text-sm leading-6 break-words text-ink" role="status">
          {notice}
          {canCreate ? null : " Create stays unavailable until a check finds no community for these URLs."}
        </p>
      ) : null}

      <form
        className="mt-5 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (canCreate) onCreate();
          else onCheckUrls();
        }}
      >
        <Field id="community-title" label="Title" hint="1–255 characters." error={shown.title}>
          {(errorId, hintId) => (
            <input
              id="community-title"
              value={form.title}
              onChange={(event) => onField("title", event.target.value)}
              aria-invalid={Boolean(shown.title) || undefined}
              aria-describedby={[hintId, errorId].filter(Boolean).join(" ")}
              className={inputClass}
            />
          )}
        </Field>

        <Field id="community-company" label="Company" hint="1–255 characters." error={shown.company}>
          {(errorId, hintId) => (
            <input
              id="community-company"
              value={form.company}
              onChange={(event) => onField("company", event.target.value)}
              aria-invalid={Boolean(shown.company) || undefined}
              aria-describedby={[hintId, errorId].filter(Boolean).join(" ")}
              className={inputClass}
            />
          )}
        </Field>

        <Field id="community-location" label="Location" hint="Optional. Up to 255 characters. Leave this blank if the posting has no location." error={shown.location}>
          {(errorId, hintId) => (
            <input
              id="community-location"
              value={form.location}
              onChange={(event) => onField("location", event.target.value)}
              aria-invalid={Boolean(shown.location) || undefined}
              aria-describedby={[hintId, errorId].filter(Boolean).join(" ")}
              className={inputClass}
            />
          )}
        </Field>

        <Field
          id="community-description"
          label="Description"
          hint="1–50000 characters. Salary and private notes do not belong here."
          error={shown.description}
        >
          {(errorId, hintId) => (
            <>
              <textarea
                id="community-description"
                value={form.description}
                rows={8}
                onChange={(event) => onField("description", event.target.value)}
                aria-invalid={Boolean(shown.description) || undefined}
                aria-describedby={[hintId, errorId].filter(Boolean).join(" ")}
                className={`${inputClass} resize-y leading-6`}
              />
              <p className="mt-1 text-xs text-muted">
                {String(form.description ?? "").trim().length.toLocaleString()} / {COMMUNITY_LIMITS.DESCRIPTION_MAX.toLocaleString()}
              </p>
            </>
          )}
        </Field>

        <div className="rounded-xl border border-line px-3 py-3">
          <p className="text-sm font-semibold text-ink">Clean up description</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Optional. This rewrites the wording for you to review. It does not check that the job details are true.
          </p>
          <button
            type="button"
            onClick={onRefine}
            disabled={busy || !String(form.description ?? "").trim()}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {phase === "refining" ? "Cleaning up…" : "Clean up description"}
          </button>
          {refineNote ? (
            <p className="mt-3 text-sm leading-6 break-words text-ink" role="status">
              {refineNote}
            </p>
          ) : null}
        </div>

        <Field
          id="community-source-url"
          label="Posting URL"
          hint="An absolute http or https link, up to 2000 characters."
          error={shown.sourceUrl}
        >
          {(errorId, hintId) => (
            <input
              id="community-source-url"
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck="false"
              value={form.sourceUrl}
              onChange={(event) => onField("sourceUrl", event.target.value)}
              aria-invalid={Boolean(shown.sourceUrl) || undefined}
              aria-describedby={[hintId, errorId].filter(Boolean).join(" ")}
              className={inputClass}
            />
          )}
        </Field>

        <fieldset className="min-w-0">
          <legend className="text-sm font-semibold text-ink">Other posting URLs</legend>
          <p className="mt-1 text-xs leading-5 text-muted">
            Up to 8 alternatives by default. You can add more than 8; the server will say if this posting allows a different number.
          </p>
          <div className="mt-3 space-y-3">
            {alternatives.map((url, index) => {
              const key = `alternativeUrls[${index}]`;
              const error = shown[key];
              const inputId = `community-alt-url-${index}`;
              return (
                <div key={inputId} className="min-w-0">
                  <label htmlFor={inputId} className="text-xs font-semibold text-muted">
                    Alternative URL {index + 1}
                  </label>
                  <div className="mt-1 flex min-w-0 flex-col gap-2 sm:flex-row">
                    <input
                      id={inputId}
                      type="text"
                      inputMode="url"
                      autoComplete="off"
                      spellCheck="false"
                      value={url}
                      onChange={(event) => onAlternative(index, event.target.value)}
                      aria-invalid={Boolean(error) || undefined}
                      aria-describedby={error ? `${inputId}-error` : undefined}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveAlternative(index)}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-line px-3 text-sm font-semibold text-ink"
                    >
                      Remove
                    </button>
                  </div>
                  {error ? (
                    <p id={`${inputId}-error`} className="mt-1 text-sm text-danger break-words">
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onAddAlternative}
            disabled={alternatives.length >= MAX_ALTERNATIVES}
            className="mt-3 text-sm font-semibold text-ink underline disabled:opacity-60"
          >
            Add another posting URL
          </button>
        </fieldset>

        {formError ? (
          <p className="rounded-xl border border-line bg-field px-4 py-3 text-sm leading-6 break-words text-danger" role="alert">
            {formError}
          </p>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {phase === "resolving" ? "Checking these URLs." : null}
          {phase === "refining" ? "Cleaning up the description." : null}
          {phase === "creating" ? "Creating the community." : null}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={primaryDisabled}
            aria-busy={busy || undefined}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {primaryLabel(phase, canCreate)}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
        </div>
        {canCreate && (!form.title.trim() || !form.company.trim() || !form.description.trim() || !form.sourceUrl.trim()) ? (
          <p className="text-sm leading-6 text-muted">Title, company, description, and a posting URL are required before you can create.</p>
        ) : null}
      </form>
    </div>
  );
}
