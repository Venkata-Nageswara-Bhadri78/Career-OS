import { FOLLOW_UP_PROMPTS } from "../../config/chatAssistantConfig";

export default function ChatFollowUps({ disabled, onUse }) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1 pb-2">
      {FOLLOW_UP_PROMPTS.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          onClick={() => onUse?.(item.prompt)}
          className="px-2.5 py-1 rounded-lg border border-line bg-bg text-[11px] font-semibold text-ink hover:bg-field disabled:opacity-40"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
