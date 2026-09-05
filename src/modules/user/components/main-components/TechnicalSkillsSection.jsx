import { useState } from "react";
import { USER_LIMITS } from "../../config/userConfig";
import FormField, { textareaFillClassName } from "../common/FormField";
import InlineEditor from "../common/InlineEditor";
import { IconCode } from "../common/UserIcons";
import EmptyState from "../sub-components/EmptyState";
import SectionAddButton from "../sub-components/SectionAddButton";
import SectionHeader from "../sub-components/SectionHeader";
import SkillChips from "../sub-components/SkillChips";

export default function TechnicalSkillsSection({ value, profile, busy = false, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState("");
  const hasSkills = Boolean(value);

  const openEditor = () => {
    setDraft(value || "");
    setLocalError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    if (busy) return;
    setEditing(false);
    setLocalError("");
  };

  const persist = async (event) => {
    event.preventDefault();
    if (draft.length > USER_LIMITS.SKILLS_MAX) {
      setLocalError("Technical skills are too long.");
      return;
    }
    setLocalError("");
    const ok = await onSave({
      headline: profile?.headline || "",
      summary: profile?.summary || "",
      technicalSkills: draft,
    });
    if (ok) setEditing(false);
  };

  return (
    <section className="user-paired-section rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={<IconCode className="h-5 w-5" />}
        title="Technical skills"
        action={
          editing ? null : (
            <SectionAddButton label={hasSkills ? "Edit skills" : "Add skills"} onClick={openEditor} />
          )
        }
      />
      <div className="user-paired-body user-hide-scrollbar pr-1">
        {editing ? (
          <InlineEditor fill onSubmit={persist} onCancel={cancelEdit} busy={busy} error={localError}>
            <FormField
              id="inline-technical-skills"
              label="Skills"
              hint="Comma-separated list. Saved as one field."
              grow
            >
              {({ id }) => (
                <textarea
                  id={id}
                  autoFocus
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={USER_LIMITS.SKILLS_MAX}
                  className={textareaFillClassName}
                  placeholder="Java, Spring Boot, React, AWS"
                />
              )}
            </FormField>
          </InlineEditor>
        ) : hasSkills ? (
          <SkillChips value={value} />
        ) : (
          <EmptyState
            compact
            icon={<IconCode className="h-8 w-8" />}
            message="No skills added yet. Skills are stored as one comma-separated list."
            actionLabel="+ Add skills"
            onAction={openEditor}
          />
        )}
      </div>
    </section>
  );
}
