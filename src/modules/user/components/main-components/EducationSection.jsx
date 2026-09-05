import { useState } from "react";
import { USER_LIMITS } from "../../config/userConfig";
import { parseFieldErrors, validateYear, validateYearOrder, yearRangeLabel } from "../../utils/formatters";
import ConfirmDialog from "../common/ConfirmDialog";
import FormField, { fieldClassName, YearInput } from "../common/FormField";
import InlineEditor from "../common/InlineEditor";
import { IconGraduation, IconPencil, IconTrash } from "../common/UserIcons";
import EmptyState from "../sub-components/EmptyState";
import SectionAddButton from "../sub-components/SectionAddButton";
import SectionHeader from "../sub-components/SectionHeader";

const EMPTY_FORM = { institutionName: "", field: "", startYear: "", endYear: "", scoreOrGrade: "" };

export default function EducationSection({ items = [], error = "", onAdd, onUpdate, onDelete }) {
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
      institutionName: item.institutionName || "",
      field: item.field || "",
      startYear: item.startYear ?? "",
      endYear: item.endYear ?? "",
      scoreOrGrade: item.scoreOrGrade || "",
    });
    setLocalError("");
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const startErr = validateYear(form.startYear, { required: true, label: "Start year" });
    const endErr = validateYear(form.endYear, { label: "End year" });
    const orderErr = validateYearOrder(form.startYear, form.endYear);
    if (!form.institutionName.trim() || !form.field.trim() || startErr || endErr || orderErr) {
      setLocalError(startErr || endErr || orderErr || "Institution name, field, and start year are required.");
      return;
    }
    const payload = {
      institutionName: form.institutionName.trim(),
      field: form.field.trim(),
      startYear: Number.parseInt(form.startYear, 10),
      endYear: form.endYear === "" ? null : Number.parseInt(form.endYear, 10),
      scoreOrGrade: form.scoreOrGrade.trim() ? form.scoreOrGrade.trim() : null,
    };
    setSaving(true);
    setLocalError("");
    const result = editing ? await onUpdate(editing.id, payload) : await onAdd(payload);
    setSaving(false);
    if (result?.ok) closeEditor();
    else setLocalError(result?.message || "Failed to save education.");
  };

  const fieldErrors = parseFieldErrors(localError || error);

  const editor = (
    <InlineEditor
      title={editing ? "Edit education" : "Add education"}
      onSubmit={handleSubmit}
      onCancel={requestClose}
      busy={saving}
      error={localError || error}
    >
      <FormField id="institutionName" label="Institution name" required error={fieldErrors.institutionName}>
        {({ id }) => <input id={id} autoFocus required maxLength={USER_LIMITS.INSTITUTION_MAX} className={fieldClassName} value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })} />}
      </FormField>
      <FormField id="field" label="Field of study" required error={fieldErrors.field}>
        {({ id }) => <input id={id} required maxLength={USER_LIMITS.FIELD_MAX} className={fieldClassName} value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} />}
      </FormField>
      <div className="grid grid-cols-2 gap-2.5">
        <FormField id="eduStartYear" label="Start year" required error={fieldErrors.startYear}>
          {({ id, describedBy, invalid }) => (
            <YearInput id={id} required describedBy={describedBy} invalid={invalid} value={form.startYear} onChange={(startYear) => setForm({ ...form, startYear })} />
          )}
        </FormField>
        <FormField id="eduEndYear" label="End year" hint="Leave blank if current" error={fieldErrors.endYear || fieldErrors.endYearValid}>
          {({ id, describedBy, invalid }) => (
            <YearInput id={id} describedBy={describedBy} invalid={invalid} value={form.endYear} onChange={(endYear) => setForm({ ...form, endYear })} placeholder="Present" />
          )}
        </FormField>
      </div>
      <FormField id="scoreOrGrade" label="Score / grade" error={fieldErrors.scoreOrGrade}>
        {({ id }) => <input id={id} maxLength={USER_LIMITS.GRADE_MAX} className={fieldClassName} value={form.scoreOrGrade} onChange={(e) => setForm({ ...form, scoreOrGrade: e.target.value })} placeholder="e.g. 9.14/10" />}
      </FormField>
    </InlineEditor>
  );

  return (
    <section className={`user-paired-section rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6${open ? " is-editing" : ""}`}>
      <SectionHeader
        icon={<IconGraduation className="h-5 w-5" />}
        title="Education"
        action={<SectionAddButton label="Add education" onClick={openAdd} disabled={atCap || (open && !editing)} />}
      />
      {atCap ? <p className="mb-2 text-xs text-muted">Maximum of 20 education records allowed.</p> : null}

      <div className="user-paired-body space-y-3 pr-1">
        {open && !editing ? editor : null}
        {items.length === 0 && !open ? (
          <EmptyState
            compact
            icon={<IconGraduation className="h-8 w-8" />}
            message="No education added yet. Add your education to complete this part of your profile."
            actionLabel="+ Add your first education"
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
                <h3 className="font-bold text-ink">{item.institutionName}</h3>
                <p className="text-sm text-ink/70">{item.field}</p>
                <p className="mt-1 text-xs text-muted">
                  {yearRangeLabel(item.startYear, item.endYear)}
                  {item.scoreOrGrade ? ` · ${item.scoreOrGrade}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-muted hover:bg-field hover:text-ink" aria-label={`Edit ${item.institutionName}`}>
                  <IconPencil />
                </button>
                <button type="button" onClick={() => setPendingDelete(item)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${item.institutionName}`}>
                  <IconTrash />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete education"
        message="This removes the education record from your career folder."
        confirmLabel="Delete education"
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          const result = await onDelete(pendingDelete.id);
          if (result?.ok) setPendingDelete(null);
        }}
      />
    </section>
  );
}
