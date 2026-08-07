import { AI_MODES, AI_MODE_CONFIG } from "../../helpers/aiModes";

export default function AiChatSidebar({
  selectedMode,
  onSelectMode,
  onNewChat,
  isOpen = true,
  onToggleOpen,
  activeJobTitle,
}) {
  const mockSessions = [
    {
      id: "session-active",
      title: activeJobTitle ? `${activeJobTitle} Prep` : "Career Copilot Session",
      mode: selectedMode,
      active: true,
      time: "Just now",
    },
    {
      id: "session-1",
      title: "Match & Gap Analysis",
      mode: AI_MODES.MATCH_ANALYSIS,
      active: false,
      time: "Yesterday",
    },
    {
      id: "session-2",
      title: "Recruiter Cold Outreach",
      mode: AI_MODES.COLD_EMAIL,
      active: false,
      time: "2 days ago",
    },
    {
      id: "session-3",
      title: "Resume X-Y-Z Polish",
      mode: AI_MODES.RESUME_REVIEW,
      active: false,
      time: "3 days ago",
    },
  ];

  return (
    <aside
      className={`border-r border-zinc-200 bg-zinc-50/70 backdrop-blur-xs flex flex-col justify-between transition-all duration-200 shrink-0 ${
        isOpen ? "w-64 lg:w-72" : "w-0 overflow-hidden border-none"
      }`}
    >
      <div className="p-3.5 flex flex-col h-full overflow-y-auto">
        {/* Top Header: New Chat & Toggle */}
        <div className="flex items-center gap-2 mb-3.5">
          <button
            type="button"
            onClick={onNewChat}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 active:scale-98 transition-all shadow-xs"
          >
            <span className="text-sm leading-none">+</span>
            <span>New Chat</span>
          </button>

          {onToggleOpen && (
            <button
              type="button"
              onClick={onToggleOpen}
              title="Close sidebar"
              className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors shrink-0"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        
        
        {/* Footer: Resume Grounded Status */}
        <div className="pt-3 border-t border-zinc-200/70">
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-zinc-900">Resume Grounded</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
              Candidate profile context is injected into AI completions.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
