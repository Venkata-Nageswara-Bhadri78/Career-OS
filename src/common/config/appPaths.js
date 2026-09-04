export const APP_PATHS = Object.freeze({
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  AI: "/ai",
  jobChat: (jobId) => `/jobs/${encodeURIComponent(String(jobId))}/interact`,
});

export function isJobChatPath(pathname) {
  return /^\/jobs\/\d+\/interact\/?$/.test(pathname || "");
}

export function readJobIdFromPath(pathname) {
  const match = String(pathname || "").match(/^\/jobs\/(\d+)\/interact\/?$/);
  if (!match) return null;
  const jobId = Number.parseInt(match[1], 10);
  return Number.isFinite(jobId) && jobId > 0 ? jobId : null;
}
