const RAW_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export const API_BASE_URL = RAW_URL.replace(/\/api\/v1\/.*$/, "").replace(/\/$/, "");
export const AI_BASE_PATH = "/api/v1/ai";

export const AI_ENDPOINTS = Object.freeze({
  BASE: AI_BASE_PATH,
  STREAM_CHAT: `${AI_BASE_PATH}/chat/stream`,
  CHAT: `${AI_BASE_PATH}/chat`,
  RESUME_CONTEXT: `${AI_BASE_PATH}/resume-context`,
  HEALTH: `${AI_BASE_PATH}/health`,
});

export default AI_ENDPOINTS;
