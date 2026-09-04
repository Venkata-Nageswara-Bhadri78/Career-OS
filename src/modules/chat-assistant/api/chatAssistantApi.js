import { del, get, post } from "../../../common/api/httpClient";
import { CHAT_ASSISTANT_ENDPOINTS } from "./chatAssistantEndpoints";

const SEND_TIMEOUT_MS = 70_000;

export function fetchChatList(query = {}) {
  return get(CHAT_ASSISTANT_ENDPOINTS.LIST, { page: 0, size: 50, ...query });
}

export function fetchJobChatHistory(jobId, query = {}) {
  return get(CHAT_ASSISTANT_ENDPOINTS.HISTORY(jobId), { page: 0, size: 50, ...query }, { timeout: SEND_TIMEOUT_MS });
}

export function sendJobChatMessage(jobId, prompt) {
  return post(
    CHAT_ASSISTANT_ENDPOINTS.SEND_MESSAGE(jobId),
    { prompt },
    { timeout: SEND_TIMEOUT_MS }
  );
}

export function deleteJobChat(jobId) {
  return del(CHAT_ASSISTANT_ENDPOINTS.DELETE(jobId));
}
