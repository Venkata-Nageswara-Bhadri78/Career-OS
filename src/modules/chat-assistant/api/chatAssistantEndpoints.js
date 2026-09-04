import { API_BASE_URL } from "../../../common/api/apiConfig";

export { API_BASE_URL };

export const CHAT_ASSISTANT_ENDPOINTS = Object.freeze({
  LIST: "/api/v1/chat-assistant",
  HISTORY: (jobId) => `/api/v1/chat-assistant/jobs/${jobId}`,
  SEND_MESSAGE: (jobId) => `/api/v1/chat-assistant/jobs/${jobId}/messages`,
  DELETE: (jobId) => `/api/v1/chat-assistant/jobs/${jobId}`,
});
