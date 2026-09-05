import { useState } from "react";
import { USER_LIMITS } from "../../config/userConfig";
import { parseFieldErrors, validateHttpUrl } from "../../utils/formatters";
import ConfirmDialog from "../common/ConfirmDialog";
import FormField, { fieldClassName, textareaClassName } from "../common/FormField";
import InlineEditor from "../common/InlineEditor";
import SafeExternalLink from "../common/SafeExternalLink";
import { IconFolder, IconPencil, IconTrash } from "../common/UserIcons";
import EmptyState from "../sub-components/EmptyState";
import SectionAddButton from "../sub-components/SectionAddButton";
import SectionHeader from "../sub-components/SectionHeader";

const EMPTY_FORM = { projectTitle: "", projectDescription: "", projectLink: "" };

export default function ProjectsSection({ items = [], error = "", onAdd, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const atCap = items.length >= USER_LIMITS.CHILD_CAP;

  const closeEditor = () => {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setLocalError("");
  };

  const requestClose = () => {
    if (saving) return;
    closeEditor();
  };

  const openAdd = () => {
    if (atCap) return;
    setEditing(null);
    setForm(EMPTY_FORM);
    setLocalError("");
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      projectTitle: item.projectTitle || "",
      projectDescription: item.projectDescription || "",
      projectLink: item.projectLink || "",
    });
    setLocalError("");
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const urlErr = validateHttpUrl(form.projectLink);
    if (!form.projectTitle.trim() || urlErr) {
      setLocalError(urlErr || "Project title is required.");
      return;
    }
    setSaving(true);
    setLocalError("");
    const result = editing ? await onUpdate(editing.id, form) : await onAdd(form);
    setSaving(false);
    if (result?.ok) closeEditor();
    else setLocalError(result?.message || "Failed to save project.");
  };

  const fieldErrors = parseFieldErrors(localError || error);

  const editor = (
    <InlineEditor
      title={editing ? "Edit project" : "Add project"}
      onSubmit={handleSubmit}
      onCancel={requestClose}
      busy={saving}
      error={localError || error}
    >
      <FormField id="projectTitle" label="Project title" required error={fieldErrors.projectTitle}>
        {({ id }) => <input id={id} autoFocus required maxLength={USER_LIMITS.PROJECT_TITLE_MAX} className={fieldClassName} value={form.projectTitle} onChange={(e) => setForm({ ...form, projectTitle: e.target.value })} />}
      </FormField>
      <FormField id="projectLink" label="Project link" error={fieldErrors.projectLink}>
        {({ id }) => <input id={id} type="url" maxLength={USER_LIMITS.URL_MAX} className={fieldClassName} value={form.projectLink} onChange={(e) => setForm({ ...form, projectLink: e.target.value })} placeholder="https://" />}
      </FormField>
      <FormField id="projectDescription" label="Description" error={fieldErrors.projectDescription}>
        {({ id }) => <textarea id={id} maxLength={USER_LIMITS.PROJECT_DESCRIPTION_MAX} rows={3} className={textareaClassName} value={form.projectDescription} onChange={(e) => setForm({ ...form, projectDescription: e.target.value })} />}
      </FormField>
    </InlineEditor>
  );

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
      <SectionHeader
        icon={<IconFolder className="h-5 w-5" />}
        title="Projects"
        action={<SectionAddButton label="Add project" onClick={openAdd} disabled={atCap || (open && !editing)} />}
      />
      {atCap ? <p className="mb-3 text-xs text-muted">Maximum of 20 project records allowed.</p> : null}

      {open && !editing ? <div className="mb-4">{editor}</div> : null}

      {items.length === 0 && !open ? (
        <EmptyState
          icon={<IconFolder className="h-8 w-8" />}
          message="No projects added yet. Add your projects to showcase your work and skills."
          actionLabel="+ Add your first project"
          onAction={openAdd}
          disabled={atCap}
        />
      ) : items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {items.map((item) =>
            open && editing?.id === item.id ? (
              <div key={item.id}>{editor}</div>
            ) : (
              <article key={item.id} className="flex w-full flex-col justify-between rounded-2xl border border-line p-5">
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-bold text-ink">{item.projectTitle}</h3>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted hover:bg-field hover:text-ink" aria-label={`Edit ${item.projectTitle}`}>
                        <IconPencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setPendingDelete(item)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${item.projectTitle}`}>
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.projectDescription ? <p className="mb-4 text-sm leading-relaxed text-ink/80">{item.projectDescription}</p> : null}
                </div>
                {item.projectLink ? <SafeExternalLink href={item.projectLink}>View project</SafeExternalLink> : null}
              </article>
            )
          )}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete project"
        message="This removes the project from your career folder."
        confirmLabel="Delete project"
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          const result = await onDelete(pendingDelete.id);
          if (result?.ok) setPendingDelete(null);
        }}
      />
    </section>
  );
}
