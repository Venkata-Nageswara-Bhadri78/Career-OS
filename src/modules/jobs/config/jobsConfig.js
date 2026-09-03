export const JOBS_PAGE_SIZE = 10;
export const JOBS_MAX_FETCH_SIZE = 50;
export const JOBS_SEARCH_MAX_LENGTH = 100;
export const JOBS_VIEW_MODE_STORAGE_KEY = "career-os-jobs-view-mode";
export const JOBS_SEARCH_DEBOUNCE_MS = 300;

export const JOBS_SORT_OPTIONS = Object.freeze([
  { value: "createdAt", label: "Date added" },
  { value: "updatedAt", label: "Last updated" },
  { value: "title", label: "Job title" },
  { value: "company", label: "Company" },
  { value: "location", label: "Location" },
  { value: "employmentType", label: "Employment type" },
  { value: "workMode", label: "Work mode" },
  { value: "experience", label: "Experience" },
]);

export const JOBS_WORK_MODE_PRESETS = Object.freeze(["Remote", "Hybrid", "On-site"]);
export const JOBS_EMPLOYMENT_TYPE_PRESETS = Object.freeze([
  "Full Time",
  "Part Time",
  "Contract",
  "Internship",
]);

export const JOBS_FILTER_ALL = "all";

export function readStoredViewMode() {
  try {
    const stored = localStorage.getItem(JOBS_VIEW_MODE_STORAGE_KEY);
    return stored === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

export function persistViewMode(mode) {
  try {
    localStorage.setItem(JOBS_VIEW_MODE_STORAGE_KEY, mode === "grid" ? "grid" : "list");
  } catch {
    /* private mode */
  }
}
