import { useNavigate } from "react-router-dom";

export default function ChatJobBanner({ job, isLoading, onOpenDetails }) {
  const navigate = useNavigate();

  return (
    <div className="w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2 shrink-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-nowrap">
        {/* Left Side: Back & Opportunity Brief (Single Line) */}
        <div className="flex items-center gap-2.5 min-w-0 flex-nowrap shrink">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-black transition-colors shrink-0"
          >
            ← Back
          </button>

          <div className="h-4 w-px bg-zinc-200 shrink-0 hidden sm:block" />

          {isLoading ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-4 w-28 bg-zinc-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-zinc-100 rounded animate-pulse" />
            </div>
          ) : job ? (
            <div className="flex items-center gap-2 min-w-0 flex-nowrap overflow-hidden">
              <span className="font-bold text-xs text-zinc-900 truncate shrink">
                {job.title}
              </span>
              <span className="text-zinc-300 text-xs shrink-0">•</span>
              <span className="text-xs text-zinc-600 truncate shrink-0">
                {job.company}
              </span>
              {job.location && (
                <>
                  <span className="text-zinc-300 text-xs shrink-0 hidden md:inline">•</span>
                  <span className="text-xs text-zinc-500 truncate shrink-0 hidden md:inline">
                    {job.location}
                  </span>
                </>
              )}
              {job.salary && (
                <span className="font-semibold text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 hidden sm:inline">
                  {job.salary}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs font-semibold text-zinc-800 truncate">
              General Career Copilot Session
            </div>
          )}
        </div>

        {/* Right Side: Skills & View Details Button (Single Line) */}
        <div className="flex items-center gap-2 shrink-0 flex-nowrap">
          {job?.skills && job.skills.length > 0 && (
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              {job.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/80 whitespace-nowrap"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">
                  +{job.skills.length - 3}
                </span>
              )}
            </div>
          )}

          {job && (
            <button
              type="button"
              onClick={onOpenDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95 transition-all shadow-xs shrink-0 whitespace-nowrap"
            >
              <svg className="h-3.5 w-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Full Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
