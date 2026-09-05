import { useState } from "react";
import { USER_LIMITS } from "../../config/userConfig";
import { hostnameFromHref, parseFieldErrors, validateHttpUrl } from "../../utils/formatters";
import ConfirmDialog from "../common/ConfirmDialog";
import FormField, { fieldClassName } from "../common/FormField";
import InlineEditor from "../common/InlineEditor";
import SafeExternalLink from "../common/SafeExternalLink";
import { IconLink, IconPencil, IconTrash } from "../common/UserIcons";
import EmptyState from "../sub-components/EmptyState";
import SectionAddButton from "../sub-components/SectionAddButton";
import SectionHeader from "../sub-components/SectionHeader";

export default function ProfileLinksSection({ items = [], error = "", onAdd, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const atCap = items.length >= USER_LIMITS.CHILD_CAP;

  const closeEditor = () => {
    setOpen(false);
    setEditing(null);
    setUrl("");
    setLocalError("");
  };

  const requestClose = () => {
    if (saving) return;
    closeEditor();
  };

  const openAdd = () => {
    if (atCap) return;
    setEditing(null);
    setUrl("");
    setLocalError("");
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setUrl(item.url || "");
    setLocalError("");
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const urlErr = validateHttpUrl(url, { required: true });
    if (urlErr) {
      setLocalError(urlErr);
      return;
    }
    setSaving(true);
    setLocalError("");
    const result = editing ? await onUpdate(editing.id, { url }) : await onAdd({ url });
    setSaving(false);
    if (result?.ok) closeEditor();
    else setLocalError(result?.message || "Failed to save link.");
  };

  const fieldErrors = parseFieldErrors(localError || error);

  const editor = (
    <InlineEditor
      title={editing ? "Edit link" : "Add link"}
      onSubmit={handleSubmit}
      onCancel={requestClose}
      busy={saving}
      error={localError || error}
    >
      <FormField id="profileUrl" label="URL" required error={fieldErrors.url}>
        {({ id }) => <input id={id} autoFocus required type="url" maxLength={USER_LIMITS.URL_MAX} className={fieldClassName} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />}
      </FormField>
    </InlineEditor>
  );

  return (
    <section className={`user-paired-section rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6${open ? " is-editing" : ""}`}>
      <SectionHeader
        icon={<IconLink className="h-5 w-5" />}
        title="Profile links"
        action={<SectionAddButton label="Add link" onClick={openAdd} disabled={atCap || (open && !editing)} />}
      />
      {atCap ? <p className="mb-2 text-xs text-muted">Maximum of 20 profile link records allowed.</p> : null}

      <div className="user-paired-body space-y-3 pr-1">
        {open && !editing ? editor : null}
        {items.length === 0 && !open ? (
          <EmptyState
            compact
            icon={<IconLink className="h-8 w-8" />}
            message="No links added yet. Add LinkedIn, GitHub, or a portfolio URL."
            actionLabel="+ Add your first link"
            onAction={openAdd}
            disabled={atCap}
          />
        ) : null}
        {items.map((item) =>
          open && editing?.id === item.id ? (
            <div key={item.id}>{editor}</div>
          ) : (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-field/40 p-4">
              <SafeExternalLink href={item.url} className="min-w-0 text-sm font-medium">
                {hostnameFromHref(item.url) || item.url}
              </SafeExternalLink>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-ink" aria-label="Edit link">
                  <IconPencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setPendingDelete(item)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" aria-label="Delete link">
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete profile link"
        message="This removes the URL from your career folder."
        confirmLabel="Delete link"
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          const result = await onDelete(pendingDelete.id);
          if (result?.ok) setPendingDelete(null);
        }}
      />
    </section>
  );
}
