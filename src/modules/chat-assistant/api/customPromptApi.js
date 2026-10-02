import { del, get, post, put } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";
import { CUSTOM_PROMPT_TIMEOUT_MS } from "../config/customPromptConfig";
import { CUSTOM_PROMPT_ENDPOINTS } from "./customPromptEndpoints";

function withTimeout(options = {}) {
  return { timeout: CUSTOM_PROMPT_TIMEOUT_MS, ...options };
}

export function fetchCustomPrompts(options = {}) {
  return get(CUSTOM_PROMPT_ENDPOINTS.LIST, undefined, withTimeout(options));
}

export function createCustomPromptRequest(body, options = {}) {
  return post(CUSTOM_PROMPT_ENDPOINTS.LIST, body, withTimeout(options));
}

export function replaceCustomPromptRequest(id, body, options = {}) {
  return put(CUSTOM_PROMPT_ENDPOINTS.BY_ID(id), body, withTimeout(options));
}

export function deleteCustomPromptRequest(id, options = {}) {
  return del(CUSTOM_PROMPT_ENDPOINTS.BY_ID(id), withTimeout(options));
}

export async function listCustomPrompts(options = {}) {
  return unwrapApiResponse(await fetchCustomPrompts(options));
}

export async function createCustomPrompt(body, options = {}) {
  return unwrapApiResponse(await createCustomPromptRequest(body, options));
}

export async function updateCustomPrompt(id, body, options = {}) {
  return unwrapApiResponse(await replaceCustomPromptRequest(id, body, options));
}

export async function deleteCustomPrompt(id, options = {}) {
  return unwrapApiResponse(await deleteCustomPromptRequest(id, options));
}

const customPromptApi = {
  fetchCustomPrompts,
  createCustomPromptRequest,
  replaceCustomPromptRequest,
  deleteCustomPromptRequest,
  listCustomPrompts,
  createCustomPrompt,
  updateCustomPrompt,
  deleteCustomPrompt,
};

export default customPromptApi;
