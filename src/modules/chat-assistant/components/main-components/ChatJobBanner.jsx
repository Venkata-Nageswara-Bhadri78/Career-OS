import { ChatIconButton, ClearIcon, ExportIcon, ShortcutsIcon } from "../common/ChatIcons";

function Field({ children, className = "" }) {
  if (!children) return null;
  return <span className={`truncate text-[12px] ${className}`}>{children}</span>;
}

export default function ChatJobBanner({
  job,
  fallbackTitle,
  fallbackCompany,
  hasJob,
  isLoading,
  canClear,
  canExport,
  isClearing,
  olderTurnsHiddenFromModel,
  onOpenDetails,
  onClear,
  onExport,
  onShortcuts,
}) {
  const title = job?.title || fallbackTitle;
  const company = job?.company || fallbackCompany;
  const location = job?.location;
  const experience = job?.experience;
  const contextNote =
    olderTurnsHiddenFromModel > 0
      ? `${olderTurnsHiddenFromModel} older turn${olderTurnsHiddenFromModel === 1 ? "" : "s"} stay visible but no longer inform new answers`
      : "Conversation for one saved job";

  return (
    <div className="w-full border-b border-line bg-bg/95 backdrop-blur-md px-3 sm:px-5 h-12 shrink-0 z-20">
      <div className="h-full flex items-center gap-3">
        <div className="flex items-center min-w-0 flex-1 overflow-hidden" title={contextNote}>
          {isLoading ? (
            <div className="flex items-center gap-6">
              <div className="h-3.5 w-28 bg-field rounded animate-pulse" />
              <div className="h-3.5 w-24 bg-field rounded animate-pulse" />
              <div className="h-3.5 w-20 bg-field rounded animate-pulse" />
            </div>
          ) : hasJob ? (
            <div className="flex items-center gap-5 sm:gap-8 min-w-0 w-full overflow-hidden">
              <button
                type="button"
                onClick={onOpenDetails}
                className="min-w-0 max-w-[28%] text-left"
                title="View job details"
              >
                <Field className="block font-bold text-ink">{title || "Saved job"}</Field>
              </button>
              <Field className="max-w-[18%] text-ink/80">{company}</Field>
              <Field className="max-w-[16%] text-muted hidden sm:inline">{location}</Field>
              <Field className="max-w-[14%] text-muted hidden md:inline">{experience}</Field>
              <span className="shrink-0 text-[11px] font-bold tracking-[0.14em] uppercase text-ink">
                RESUME
              </span>
            </div>
          ) : (
            <p className="text-[12px] font-semibold text-ink truncate">Select a saved job to start a private thread</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ChatIconButton label="Keyboard shortcuts" onClick={onShortcuts} className="h-8 w-8">
            <ShortcutsIcon className="h-4 w-4" />
          </ChatIconButton>
          <ChatIconButton
            label="Export conversation"
            onClick={onExport}
            disabled={!hasJob || !canExport}
            className="h-8 w-8"
          >
            <ExportIcon className="h-4 w-4" />
          </ChatIconButton>
          <ChatIconButton
            label={isClearing ? "Clearing conversation" : "Clear conversation"}
            onClick={onClear}
            disabled={!canClear || isClearing}
            tone="danger"
            className="h-8 w-8"
          >
            <ClearIcon className="h-4 w-4" />
          </ChatIconButton>
        </div>
      </div>
    </div>
  );
}
