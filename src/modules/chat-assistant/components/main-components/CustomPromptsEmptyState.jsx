import { CustomPromptsIcon, PlusIcon } from "../common/ChatIcons";

export default function CustomPromptsEmptyState({ onCreate }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-field text-ink">
          <CustomPromptsIcon className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-ink">No custom prompts yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Save prompts you reuse often. They stay in your account and can be inserted into any job chat.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white"
        >
          <PlusIcon className="h-4 w-4" />
          Create New Prompt
        </button>
      </div>
    </div>
  );
}
