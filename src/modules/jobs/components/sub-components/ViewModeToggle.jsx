export default function ViewModeToggle({ viewMode, onChange }) {
  return (
    <div
      className="inline-flex h-8 p-0.5 rounded-lg border border-line bg-white"
      role="group"
      aria-label="Job view mode"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        title="Grid view"
        aria-pressed={viewMode === "grid"}
        className={`inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors ${
          viewMode === "grid" ? "bg-ink text-white" : "text-muted hover:text-ink hover:bg-field"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        title="List view"
        aria-pressed={viewMode === "list"}
        className={`inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors ${
          viewMode === "list" ? "bg-ink text-white" : "text-muted hover:text-ink hover:bg-field"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
