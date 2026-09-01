import AiSpinner from "./AiSpinner";

export default function AiThinkingIndicator({ mode = "Career Copilot" }) {
  return (
    <div className="flex gap-3 justify-start items-start animate-in fade-in duration-200">
      <div className="h-7 w-7 rounded-xl bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-xs ring-1 ring-black/10">
        AI
      </div>
      <div className="rounded-2xl px-4 py-3 bg-white border border-zinc-200/80 shadow-xs flex items-center gap-3 text-xs text-zinc-600">
        <AiSpinner className="h-3.5 w-3.5 text-zinc-900" />
        <span className="font-medium text-zinc-700">Formulating response...</span>
        <div className="flex items-center gap-1 pl-1">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
