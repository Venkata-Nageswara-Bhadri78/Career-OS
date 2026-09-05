import { AI_MODE_OPTIONS } from "../../config/aiConfig";

export default function AiModeTabs({ selectedMode, onSelectMode, disabled }) {
  return (
    <div className="px-4 sm:px-8 md:px-12" role="tablist" aria-label="Copilot mode">
      <div className="ai-mode-scroll flex gap-1.5 overflow-x-auto pb-1">
        {AI_MODE_OPTIONS.map((mode) => {
          const selected = mode.id === selectedMode;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={disabled}
              title={mode.description}
              onClick={() => onSelectMode?.(mode.id)}
              className={`shrink-0 h-8 px-3 rounded-xl text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                selected ? "bg-ink text-white border-accent" : "bg-white text-ink border-line hover:bg-field"
              }`}
            >
              {mode.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
