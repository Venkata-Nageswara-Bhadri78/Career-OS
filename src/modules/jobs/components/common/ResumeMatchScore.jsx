import { getResumeMatchScoreBand } from "../../config/matchScore";

export default function ResumeMatchScore({ score, compact = false }) {
  const band = getResumeMatchScoreBand(score);
  const progress = band ? band.score * 3.6 : 0;
  const color = band?.color ?? "#e5e7eb";
  const label = band
    ? `Resume to job score ${band.score}, ${band.label}`
    : "Resume to job score unavailable";

  return (
    <div className={compact ? "inline-flex shrink-0" : "flex shrink-0 flex-col items-center gap-0.5"}>
      <div
        className={
          compact
            ? "grid h-5 w-5 place-items-center rounded-full"
            : "grid h-10 w-10 place-items-center rounded-full"
        }
        style={{
          background: `conic-gradient(${color} ${progress}deg, #e5e7eb ${progress}deg)`,
        }}
        role="img"
        aria-label={label}
        title={band ? `${band.score} — ${band.label}` : "No score"}
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full bg-white ${
            compact ? "h-[calc(100%-3px)] w-[calc(100%-3px)]" : "h-[calc(100%-5px)] w-[calc(100%-5px)]"
          }`}
        >
          <span
            className={`font-bold leading-none tabular-nums ${
              compact ? "text-[8px]" : "text-[11px]"
            }`}
            style={{ color: band ? band.text : "#6b7280" }}
          >
            {band ? band.score : "—"}
          </span>
        </div>
      </div>
      {compact ? null : (
        <span className="max-w-10 text-center text-[9px] leading-tight text-muted">
          {band?.label ?? "No score"}
        </span>
      )}
    </div>
  );
}
