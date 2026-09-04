import { del, get, post } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";
import { CHAT_ASSISTANT_LIMITS, HISTORY_TIMEOUT_MS, SEND_TIMEOUT_MS } from "../config/chatAssistantConfig";
import { CHAT_ASSISTANT_ENDPOINTS } from "./chatAssistantEndpoints";

function pageQuery(query = {}) {
  const page = Number.isInteger(query.page) && query.page >= 0 ? query.page : 0;
  const requested = Number.isInteger(query.size) ? query.size : CHAT_ASSISTANT_LIMITS.PAGE_SIZE;
  const size = Math.min(CHAT_ASSISTANT_LIMITS.PAGE_SIZE_MAX, Math.max(CHAT_ASSISTANT_LIMITS.PAGE_SIZE_MIN, requested));
  return { page, size };
}

export function fetchChatList(query = {}, options = {}) {
  return get(CHAT_ASSISTANT_ENDPOINTS.LIST, pageQuery(query), {
    timeout: HISTORY_TIMEOUT_MS,
    ...options,
  });
}

export function fetchJobChatHistory(jobId, query = {}, options = {}) {
  return get(CHAT_ASSISTANT_ENDPOINTS.HISTORY(jobId), pageQuery(query), {
    timeout: options.timeout ?? HISTORY_TIMEOUT_MS,
    ...options,
  });
}

export function sendJobChatMessage(jobId, prompt, options = {}) {
  return post(
    CHAT_ASSISTANT_ENDPOINTS.SEND_MESSAGE(jobId),
    { prompt },
    { timeout: SEND_TIMEOUT_MS, ...options }
  );
}

export function deleteJobChat(jobId, options = {}) {
  return del(CHAT_ASSISTANT_ENDPOINTS.DELETE(jobId), {
    timeout: HISTORY_TIMEOUT_MS,
    ...options,
  });
}

export async function listChats(query = {}, options = {}) {
  return unwrapApiResponse(await fetchChatList(query, options));
}

export async function getJobChatHistory(jobId, query = {}, options = {}) {
  return unwrapApiResponse(await fetchJobChatHistory(jobId, query, options));
}

export async function postJobChatMessage(jobId, prompt, options = {}) {
  return unwrapApiResponse(await sendJobChatMessage(jobId, prompt, options), 502);
}

export async function clearJobChat(jobId, options = {}) {
  return unwrapApiResponse(await deleteJobChat(jobId, options));
}

const chatAssistantApi = {
  fetchChatList,
  fetchJobChatHistory,
  sendJobChatMessage,
  deleteJobChat,
  listChats,
  getJobChatHistory,
  postJobChatMessage,
  clearJobChat,
};

export default chatAssistantApi;
