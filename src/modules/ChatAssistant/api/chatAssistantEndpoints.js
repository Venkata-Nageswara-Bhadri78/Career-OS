export const API_BASE_URL = "http://localhost:8080";

export const CHAT_ASSISTANT_ENDPOINTS = {
    LIST: "/api/v1/chat-assistant",
    HISTORY: (jobId) => `/api/v1/chat-assistant/jobs/${jobId}`,
    SEND_MESSAGE: (jobId) => `/api/v1/chat-assistant/jobs/${jobId}/messages`,
    DELETE: (jobId) => `/api/v1/chat-assistant/jobs/${jobId}`
};
