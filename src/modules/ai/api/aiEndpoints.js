const AI_BASE_PATH = "/api/v1/ai";

export const AI_ENDPOINTS = Object.freeze({
  CHAT: `${AI_BASE_PATH}/chat`,
  STREAM_CHAT: `${AI_BASE_PATH}/chat/stream`,
  RESUME_CONTEXT: `${AI_BASE_PATH}/resume-context`,
  HEALTH: `${AI_BASE_PATH}/health`,
  CONFIG: `${AI_BASE_PATH}/config`,
});

/** Supporting read so the copilot can send an owned `jobId`. Not an `/api/v1/ai` route. */
export const AI_CONTEXT_ENDPOINTS = Object.freeze({
  SAVED_JOBS: "/api/v1/jobs",
});

export default AI_ENDPOINTS;
