import { useEffect, useState } from "react";
import Spinner from "./Spinner";

const STAGES = [
  "Reading the pasted posting…",
  "Extracting structured fields…",
  "Cross-checking for duplicates…",
  "Finalizing your preview…",
];

export default function JobExtractionLoader() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1 < STAGES.length ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div className="relative h-16 w-16 flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-2xl bg-black/5 animate-ping" />
        <div className="relative h-16 w-16 rounded-2xl bg-black flex items-center justify-center shadow-lg">
          <Spinner className="h-7 w-7 text-white" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Analyzing job posting…</h3>
      <p className="text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">
        This can take a few seconds while the AI reads through the content.
      </p>

      <div className="mt-6 flex items-center gap-1 pl-1">
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
      </div>

      <div className="mt-6 w-full max-w-xs space-y-2">
        {STAGES.map((stage, idx) => (
          <div
            key={stage}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[11px] font-medium transition-all duration-300 ${
              idx === stageIndex
                ? "bg-zinc-900 text-white shadow-xs"
                : idx < stageIndex
                ? "text-zinc-400"
                : "text-zinc-300"
            }`}
          >
            {idx < stageIndex ? (
              <span className="shrink-0">✓</span>
            ) : idx === stageIndex ? (
              <Spinner className="h-3 w-3 text-white shrink-0" />
            ) : (
              <span className="h-1 w-1 rounded-full bg-zinc-300 shrink-0" />
            )}
            <span className="truncate">{stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
