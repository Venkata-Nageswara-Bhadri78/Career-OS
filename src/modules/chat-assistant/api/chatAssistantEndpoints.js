const CHAT_ASSISTANT_BASE_PATH = "/api/v1/chat-assistant";

export const CHAT_ASSISTANT_ENDPOINTS = Object.freeze({
  LIST: CHAT_ASSISTANT_BASE_PATH,
  HISTORY: (jobId) => `${CHAT_ASSISTANT_BASE_PATH}/jobs/${jobId}`,
  SEND_MESSAGE: (jobId) => `${CHAT_ASSISTANT_BASE_PATH}/jobs/${jobId}/messages`,
  DELETE: (jobId) => `${CHAT_ASSISTANT_BASE_PATH}/jobs/${jobId}`,
});

export default CHAT_ASSISTANT_ENDPOINTS;
