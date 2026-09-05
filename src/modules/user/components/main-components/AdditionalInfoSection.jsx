import { useState } from "react";
import { USER_LIMITS } from "../../config/userConfig";
import { parseFieldErrors, validateHttpUrl } from "../../utils/formatters";
import ConfirmDialog from "../common/ConfirmDialog";
import FormField, { fieldClassName, textareaClassName } from "../common/FormField";
import InlineEditor from "../common/InlineEditor";
import SafeExternalLink from "../common/SafeExternalLink";
import { IconDocument, IconPencil, IconTrash } from "../common/UserIcons";
import EmptyState from "../sub-components/EmptyState";
import SectionAddButton from "../sub-components/SectionAddButton";
import SectionHeader from "../sub-components/SectionHeader";

const EMPTY_FORM = { type: "", description: "", link: "" };

export default function AdditionalInfoSection({ items = [], error = "", onAdd, onUpdate, onDelete }) {
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
      type: item.type || "",
      description: item.description || "",
      link: item.link || "",
    });
    setLocalError("");
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const urlErr = validateHttpUrl(form.link);
    if (!form.type.trim() || urlErr) {
      setLocalError(urlErr || "Type is required.");
      return;
    }
    setSaving(true);
    setLocalError("");
    const result = editing ? await onUpdate(editing.id, form) : await onAdd(form);
    setSaving(false);
    if (result?.ok) closeEditor();
    else setLocalError(result?.message || "Failed to save information.");
  };

  const fieldErrors = parseFieldErrors(localError || error);

  const editor = (
    <InlineEditor
      title={editing ? "Edit additional info" : "Add additional info"}
      onSubmit={handleSubmit}
      onCancel={requestClose}
      busy={saving}
      error={localError || error}
    >
      <FormField id="infoType" label="Type" required hint="Free text, for example Certification or Language." error={fieldErrors.type}>
        {({ id }) => <input id={id} autoFocus required maxLength={USER_LIMITS.ADDITIONAL_TYPE_MAX} className={fieldClassName} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />}
      </FormField>
      <FormField id="infoDescription" label="Description" error={fieldErrors.description}>
        {({ id }) => <textarea id={id} maxLength={USER_LIMITS.DESCRIPTION_MAX} rows={3} className={textareaClassName} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />}
      </FormField>
      <FormField id="infoLink" label="Link" error={fieldErrors.link}>
        {({ id }) => <input id={id} type="url" maxLength={USER_LIMITS.URL_MAX} className={fieldClassName} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://" />}
      </FormField>
    </InlineEditor>
  );

  return (
    <section className={`user-paired-section rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6${open ? " is-editing" : ""}`}>
      <SectionHeader
        icon={<IconDocument className="h-5 w-5" />}
        title="Additional information"
        action={<SectionAddButton label="Add information" onClick={openAdd} disabled={atCap || (open && !editing)} />}
      />
      {atCap ? <p className="mb-2 text-xs text-muted">Maximum of 20 additional information records allowed.</p> : null}

      <div className="user-paired-body space-y-3 pr-1">
        {open && !editing ? editor : null}
        {items.length === 0 && !open ? (
          <EmptyState
            compact
            icon={<IconDocument className="h-8 w-8" />}
            message="No additional information added yet. Use this for certifications, languages, or other notes."
            actionLabel="+ Add information"
            onAction={openAdd}
            disabled={atCap}
          />
        ) : null}
        {items.map((item) =>
          open && editing?.id === item.id ? (
            <div key={item.id}>{editor}</div>
          ) : (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-4">
              <div className="min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{item.type}</h3>
                {item.description ? <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{item.description}</p> : null}
                {item.link ? <div className="mt-2"><SafeExternalLink href={item.link}>View link</SafeExternalLink></div> : null}
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted hover:bg-field hover:text-ink" aria-label={`Edit ${item.type}`}>
                  <IconPencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setPendingDelete(item)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${item.type}`}>
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete additional information"
        message="This removes the entry from your career folder."
        confirmLabel="Delete entry"
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          const result = await onDelete(pendingDelete.id);
          if (result?.ok) setPendingDelete(null);
        }}
      />
    </section>
  );
}
