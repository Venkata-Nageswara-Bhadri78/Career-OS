const RAW_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export const API_BASE_URL = RAW_URL.replace(/\/api\/v1\/.*$/, "").replace(/\/$/, "");
export const JOB_EXTRACTION_BASE_PATH = "/api/v1/job-extraction";

export const JOB_EXTRACTION_ENDPOINTS = Object.freeze({
  PARSE: `${JOB_EXTRACTION_BASE_PATH}/parse`,
});

export default JOB_EXTRACTION_ENDPOINTS;
