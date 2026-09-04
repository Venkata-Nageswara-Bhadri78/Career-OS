const FEATURES = [
  {
    title: "Zero manual typing",
    desc: "Paste the link and the page text — every field is filled in for you.",
  },
  {
    title: "Never invents data",
    desc: "Anything not clearly present in the posting is left blank, never guessed.",
  },
  {
    title: "Duplicate-safe",
    desc: "Postings you've already saved are detected before we even call the AI.",
  },
];

export default function JobExtractionEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div className="relative mb-6">
        <div className="h-16 w-16 rounded-2xl bg-ink flex items-center justify-center shadow-lg">
          <svg className="h-8 w-8 text-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.99-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-accent border-2 border-bg flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-bg" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-ink tracking-tight">AI-Powered Job Extraction</h3>
      <p className="text-xs text-muted mt-2 max-w-sm leading-relaxed">
        Fill in the job URL and paste the posting on the left, then hit{" "}
        <span className="font-semibold text-ink">Extract Job Info</span> — your review form will
        appear here.
      </p>

      <div className="mt-8 w-full max-w-sm space-y-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-bg border border-line shadow-xs text-left"
          >
            <span className="h-6 w-6 rounded-full bg-field text-ink flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <div>
              <p className="text-xs font-semibold text-ink">{f.title}</p>
              <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
