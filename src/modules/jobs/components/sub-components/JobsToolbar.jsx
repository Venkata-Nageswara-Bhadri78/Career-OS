import {
  JOBS_EMPLOYMENT_TYPE_PRESETS,
  JOBS_FILTER_ALL,
  JOBS_SORT_OPTIONS,
  JOBS_WORK_MODE_PRESETS,
} from "../../config/jobsConfig";
import ViewModeToggle from "./ViewModeToggle";

const controlClass =
  "h-8 px-2 text-[11px] rounded-lg border border-line bg-white text-ink focus:border-ink focus:outline-none";

export default function JobsToolbar({
  searchInput,
  onSearchChange,
  sortBy,
  sortDir,
  onSortChange,
  onToggleSortDir,
  workModeFilter,
  employmentTypeFilter,
  onWorkModeFilterChange,
  onEmploymentTypeFilterChange,
  onClearFilters,
  viewMode,
  onViewModeChange,
  onAddJob,
  clientFiltersActive,
}) {
  const filtersActive =
    clientFiltersActive ||
    workModeFilter !== JOBS_FILTER_ALL ||
    employmentTypeFilter !== JOBS_FILTER_ALL;

  return (
    <div className="flex flex-col gap-2 shrink-0 px-0.5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs, companies, locations..."
            aria-label="Search jobs"
            className={`w-full pl-8 pr-2.5 ${controlClass}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort jobs by"
            className={`${controlClass} font-medium min-w-[120px]`}
          >
            {JOBS_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onToggleSortDir}
            title={sortDir === "asc" ? "Ascending order" : "Descending order"}
            aria-label={`Sort direction: ${sortDir === "asc" ? "ascending" : "descending"}`}
            className={`${controlClass} font-semibold min-w-[68px]`}
          >
            {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>

          <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />

          <button
            type="button"
            onClick={onAddJob}
            className="inline-flex items-center gap-1 h-8 px-3 text-[11px] font-semibold rounded-lg bg-ink text-white hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
          >
            <span className="text-base leading-none">+</span>
            <span>Add Job</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Filters</span>
        <select
          value={workModeFilter}
          onChange={(e) => onWorkModeFilterChange(e.target.value)}
          aria-label="Filter by work mode"
          className={`${controlClass} min-w-[108px]`}
        >
          <option value={JOBS_FILTER_ALL}>All work modes</option>
          {JOBS_WORK_MODE_PRESETS.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
        <select
          value={employmentTypeFilter}
          onChange={(e) => onEmploymentTypeFilterChange(e.target.value)}
          aria-label="Filter by employment type"
          className={`${controlClass} min-w-[96px]`}
        >
          <option value={JOBS_FILTER_ALL}>All types</option>
          {JOBS_EMPLOYMENT_TYPE_PRESETS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {filtersActive ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="h-8 px-2 text-[11px] font-medium rounded-lg text-accent hover:bg-field transition-colors"
          >
            Clear filters
          </button>
        ) : null}
        {clientFiltersActive ? (
          <span className="text-[10px] text-muted">Filters apply to your latest {50} saved jobs.</span>
        ) : null}
      </div>
    </div>
  );
}
