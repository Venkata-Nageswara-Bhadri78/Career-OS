import { useState } from "react";
import { USER_LIMITS } from "../../config/userConfig";
import { parseFieldErrors, validateYear, validateYearOrder, yearRangeLabel } from "../../utils/formatters";
import ConfirmDialog from "../common/ConfirmDialog";
import FormField, { fieldClassName, textareaClassName, YearInput } from "../common/FormField";
import InlineEditor from "../common/InlineEditor";
import { IconBriefcase, IconPencil, IconTrash } from "../common/UserIcons";
import EmptyState from "../sub-components/EmptyState";
import SectionAddButton from "../sub-components/SectionAddButton";
import SectionHeader from "../sub-components/SectionHeader";

const EMPTY_FORM = { companyName: "", jobTitle: "", startYear: "", endYear: "", description: "" };

export default function WorkExperienceSection({ items = [], error = "", onAdd, onUpdate, onDelete }) {
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
      companyName: item.companyName || "",
      jobTitle: item.jobTitle || "",
      startYear: item.startYear ?? "",
      endYear: item.endYear ?? "",
      description: item.description || "",
    });
    setLocalError("");
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const startErr = validateYear(form.startYear, { required: true, label: "Start year" });
    const endErr = validateYear(form.endYear, { label: "End year" });
    const orderErr = validateYearOrder(form.startYear, form.endYear);
    if (!form.companyName.trim() || !form.jobTitle.trim() || startErr || endErr || orderErr) {
      setLocalError(startErr || endErr || orderErr || "Company name, job title, and start year are required.");
      return;
    }
    const payload = {
      companyName: form.companyName.trim(),
      jobTitle: form.jobTitle.trim(),
      startYear: Number.parseInt(form.startYear, 10),
      endYear: form.endYear === "" ? null : Number.parseInt(form.endYear, 10),
      description: form.description.trim() ? form.description : null,
    };
    setSaving(true);
    setLocalError("");
    const result = editing ? await onUpdate(editing.id, payload) : await onAdd(payload);
    setSaving(false);
    if (result?.ok) closeEditor();
    else setLocalError(result?.message || "Failed to save work experience.");
  };

  const fieldErrors = parseFieldErrors(localError || error);

  const editor = (
    <InlineEditor
      title={editing ? "Edit experience" : "Add experience"}
      onSubmit={handleSubmit}
      onCancel={requestClose}
      busy={saving}
      error={localError || error}
    >
      <FormField id="jobTitle" label="Job title" required error={fieldErrors.jobTitle}>
        {({ id }) => (
          <input id={id} autoFocus required maxLength={USER_LIMITS.JOB_TITLE_MAX} className={fieldClassName} value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
        )}
      </FormField>
      <FormField id="companyName" label="Company name" required error={fieldErrors.companyName}>
        {({ id }) => (
          <input id={id} required maxLength={USER_LIMITS.COMPANY_MAX} className={fieldClassName} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        )}
      </FormField>
      <div className="grid grid-cols-2 gap-2.5">
        <FormField id="startYear" label="Start year" required error={fieldErrors.startYear}>
          {({ id, describedBy, invalid }) => (
            <YearInput id={id} required describedBy={describedBy} invalid={invalid} value={form.startYear} onChange={(startYear) => setForm({ ...form, startYear })} />
          )}
        </FormField>
        <FormField id="endYear" label="End year" hint="Leave blank if current" error={fieldErrors.endYear || fieldErrors.endYearValid}>
          {({ id, describedBy, invalid }) => (
            <YearInput id={id} describedBy={describedBy} invalid={invalid} value={form.endYear} onChange={(endYear) => setForm({ ...form, endYear })} placeholder="Present" />
          )}
        </FormField>
      </div>
      <FormField id="description" label="Description" error={fieldErrors.description}>
        {({ id }) => (
          <textarea id={id} maxLength={USER_LIMITS.DESCRIPTION_MAX} rows={3} className={textareaClassName} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        )}
      </FormField>
    </InlineEditor>
  );

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
      <SectionHeader
        icon={<IconBriefcase className="h-5 w-5" />}
        title="Work experience"
        action={<SectionAddButton label="Add experience" onClick={openAdd} disabled={atCap || (open && !editing)} />}
      />

      {atCap ? <p className="mb-3 text-xs text-muted">Maximum of 20 work experience records allowed.</p> : null}

      {open && !editing ? <div className="mb-4">{editor}</div> : null}

      {items.length === 0 && !open ? (
        <EmptyState
          icon={<IconBriefcase className="h-8 w-8" />}
          message="No work experience added yet. Add your work experience to showcase your professional background."
          actionLabel="+ Add your first experience"
          onAction={openAdd}
          disabled={atCap}
        />
      ) : items.length > 0 ? (
        <ol className="space-y-0">
          {items.map((item, index) => (
            <li key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="mt-1.5 h-3 w-3 rounded-full bg-accent" />
                {index !== items.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
              </div>
              <div className="min-w-0 flex-1 pb-6">
                {open && editing?.id === item.id ? (
                  editor
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-ink">{item.jobTitle}</h3>
                        <p className="text-sm font-medium text-ink/70">{item.companyName}</p>
                        <p className="mt-1 text-xs text-muted">{yearRangeLabel(item.startYear, item.endYear)}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted hover:bg-field hover:text-ink" aria-label={`Edit ${item.jobTitle}`}>
                          <IconPencil />
                        </button>
                        <button type="button" onClick={() => setPendingDelete(item)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${item.jobTitle}`}>
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                    {item.description ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{item.description}</p> : null}
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete work experience"
        message="This removes the role from your career folder. This cannot be undone."
        confirmLabel="Delete experience"
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          const result = await onDelete(pendingDelete.id);
          if (result?.ok) setPendingDelete(null);
        }}
      />
    </section>
  );
}
