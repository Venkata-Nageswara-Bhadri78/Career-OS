export const APP_PATHS = Object.freeze({
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PRE_COMPLETE: "/pre-complete",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  AI: "/ai",
  CUSTOM_PROMPTS: "/custom-prompts",
  JOB_DRAFTS: "/job-drafts",
  jobDetails: (jobId) => `/jobs/${encodeURIComponent(String(jobId))}`,
  jobChat: (jobId) => `/jobs/${encodeURIComponent(String(jobId))}/interact`,
});

export function isJobDetailsPath(pathname) {
  return /^\/jobs\/\d+\/?$/.test(pathname || "");
}

export function isJobChatPath(pathname) {
  return /^\/jobs\/\d+\/interact\/?$/.test(pathname || "");
}

export function readJobIdFromPath(pathname) {
  const match = String(pathname || "").match(/^\/jobs\/(\d+)\/interact\/?$/);
  if (!match) return null;
  const jobId = Number.parseInt(match[1], 10);
  return Number.isFinite(jobId) && jobId > 0 ? jobId : null;
}
