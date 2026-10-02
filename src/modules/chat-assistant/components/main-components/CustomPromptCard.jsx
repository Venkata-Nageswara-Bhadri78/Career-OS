import { formatPromptUpdatedAt } from "../../mappers/customPromptMapper";
import { EditIcon, TrashIcon } from "../common/ChatIcons";

export default function CustomPromptCard({ prompt, busy = false, onEdit, onDelete }) {
  const updatedLabel = formatPromptUpdatedAt(prompt.updatedAt || prompt.createdAt);

  return (
    <article className="flex min-h-[220px] flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <h2 className="text-base font-semibold leading-snug text-ink break-words">{prompt.title}</h2>
        {updatedLabel ? <p className="mt-1 text-[11px] text-muted">Updated {updatedLabel}</p> : null}
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted line-clamp-5 break-words whitespace-pre-wrap">
        {prompt.prompt}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(prompt)}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-field px-3 text-xs font-medium text-ink disabled:opacity-50"
          aria-label={`Edit ${prompt.title}`}
        >
          <EditIcon className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(prompt)}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-field px-3 text-xs font-medium text-ink disabled:opacity-50"
          aria-label={`Delete ${prompt.title}`}
        >
          <TrashIcon className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </article>
  );
}
