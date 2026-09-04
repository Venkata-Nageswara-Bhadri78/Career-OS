const RAW_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const API_BASE_URL = String(RAW_URL)
  .trim()
  .replace(/\/api\/v1(?:\/.*)?$/, "")
  .replace(/\/$/, "");

export const API_PREFIX = "/api/v1";
export const INTERNAL_API_PREFIX = `${API_PREFIX}/internal`;
export const INTERNAL_API_HEADER = "X-Internal-Api-Key";
