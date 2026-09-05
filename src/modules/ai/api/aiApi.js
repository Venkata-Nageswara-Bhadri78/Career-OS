import { INTERNAL_API_PREFIX } from "../../../common/api/apiConfig";
import { ApiError, AUTH_MESSAGES, CLIENT_COPY, isApiError } from "../../../common/api/apiError";
import { buildUrl, get, post } from "../../../common/api/httpClient";
import { endSession, getAuthorizationHeader, refreshSession } from "../../../common/api/sessionBridge";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";
import { CHAT_TIMEOUT_MS, METADATA_TIMEOUT_MS, SAVED_JOBS_PAGE_SIZE } from "../config/aiConfig";
import {
  buildChatRequest,
  mapChatResponse,
  mapHealthMetadata,
  mapResumeContextResult,
  mapSavedJobOptions,
} from "../mappers/aiMapper";
import { AI_CONTEXT_ENDPOINTS, AI_ENDPOINTS } from "./aiEndpoints";
import {
  consumeSseFrames,
  isDoneChunk,
  isErrorChunk,
  parseSseData,
  readChunkText,
  stripAiErrorPrefix,
} from "../utils/sseParser";

function assertBrowserSafeEndpoint(endpoint) {
  const path = String(endpoint || "").split("?")[0].toLowerCase();
  if (path === INTERNAL_API_PREFIX || path.startsWith(`${INTERNAL_API_PREFIX}/`)) {
    throw new ApiError({ message: CLIENT_COPY.blocked, status: 403, data: null });
  }
}

function envelopeMessage(data) {
  return typeof data?.message === "string" ? data.message.trim() : "";
}

function parseRetryAfter(response, data) {
  const header = response.headers.get("Retry-After");
  if (header) {
    const seconds = Number.parseInt(header, 10);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  }
  const fromBody = data?.retryAfter ?? data?.data?.retryAfter;
  return Number.isFinite(fromBody) && fromBody >= 0 ? fromBody : null;
}

async function parseErrorBody(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  const text = await response.text().catch(() => "");
  return text ? { message: text } : null;
}

function shouldRefresh(status, message, isRetry) {
  if (isRetry || status !== 401) return false;
  if (message === AUTH_MESSAGES.NOT_AUTHENTICATED) return false;
  if (message === AUTH_MESSAGES.INVALID_INTERNAL_KEY) return false;
  return message === AUTH_MESSAGES.UNAUTHORIZED || message === "";
}

function mergeAbort(userSignal, timeoutMs) {
  const timeoutController = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, timeoutMs);

  const onUserAbort = () => timeoutController.abort();
  if (userSignal) {
    if (userSignal.aborted) timeoutController.abort();
    else userSignal.addEventListener("abort", onUserAbort, { once: true });
  }

  return {
    signal: timeoutController.signal,
    timedOut: () => timedOut,
    cleanup: () => {
      clearTimeout(timer);
      if (userSignal) userSignal.removeEventListener("abort", onUserAbort);
    },
  };
}

export async function completeChat(input, options = {}) {
  const body = buildChatRequest(input);
  const res = await post(AI_ENDPOINTS.CHAT, body, {
    timeout: options.timeout ?? CHAT_TIMEOUT_MS,
    signal: options.signal,
  });
  return mapChatResponse(unwrapApiResponse(res, 502));
}

export async function getResumeContextStatus(options = {}) {
  try {
    const res = await get(AI_ENDPOINTS.RESUME_CONTEXT, {}, {
      timeout: options.timeout ?? METADATA_TIMEOUT_MS,
      signal: options.signal,
    });
    unwrapApiResponse(res);
    return mapResumeContextResult(null);
  } catch (err) {
    return mapResumeContextResult(err);
  }
}

export async function getAiHealth(options = {}) {
  const res = await get(AI_ENDPOINTS.HEALTH, {}, {
    timeout: options.timeout ?? METADATA_TIMEOUT_MS,
    signal: options.signal,
  });
  return mapHealthMetadata(unwrapApiResponse(res));
}

export async function getAiConfig(options = {}) {
  const res = await get(AI_ENDPOINTS.CONFIG, {}, {
    timeout: options.timeout ?? METADATA_TIMEOUT_MS,
    signal: options.signal,
  });
  return mapHealthMetadata(unwrapApiResponse(res));
}

export async function getAiMetadata(options = {}) {
  try {
    return await getAiConfig(options);
  } catch (err) {
    if (err?.status === 404) return getAiHealth(options);
    throw err;
  }
}

export async function listSavedJobsForContext(options = {}) {
  const res = await get(
    AI_CONTEXT_ENDPOINTS.SAVED_JOBS,
    { page: 0, size: SAVED_JOBS_PAGE_SIZE, sortBy: "updatedAt", sortDir: "desc" },
    { timeout: options.timeout ?? METADATA_TIMEOUT_MS, signal: options.signal }
  );
  return mapSavedJobOptions(unwrapApiResponse(res));
}

async function readSseStream(response, { onToken, signal }) {
  if (!response.body || typeof response.body.getReader !== "function") {
    throw new ApiError({
      message: "Streaming is not supported in this browser.",
      status: 500,
      data: null,
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let accumulated = "";

  const flushFrame = (frame) => {
    const chunk = parseSseData(frame.data);
    if (isErrorChunk(frame.event, chunk)) {
      const message = stripAiErrorPrefix(readChunkText(chunk)) || "The AI service could not complete that reply.";
      throw new ApiError({ message, status: 502, data: null });
    }
    if (isDoneChunk(frame.event, chunk)) {
      return "done";
    }
    const token = readChunkText(chunk);
    if (token) {
      accumulated += token;
      onToken?.(token, accumulated);
    }
    return "continue";
  };

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parsed = consumeSseFrames(buffer);
      buffer = parsed.rest;
      for (const frame of parsed.events) {
        if (flushFrame(frame) === "done") return accumulated;
      }
    }

    if (buffer.trim()) {
      const parsed = consumeSseFrames(`${buffer}\n\n`);
      for (const frame of parsed.events) {
        if (flushFrame(frame) === "done") return accumulated;
      }
    }

    return accumulated;
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }
}

export async function streamChat(input, callbacks = {}, options = {}) {
  assertBrowserSafeEndpoint(AI_ENDPOINTS.STREAM_CHAT);

  const body = buildChatRequest(input);
  const timeout = options.timeout ?? CHAT_TIMEOUT_MS;
  const isRetry = Boolean(options.isRetry);
  const abort = mergeAbort(options.signal, timeout);
  const bearerToken = getAuthorizationHeader();

  try {
    const response = await fetch(buildUrl(AI_ENDPOINTS.STREAM_CHAT), {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        ...(bearerToken ? { Authorization: bearerToken } : {}),
      },
      body: JSON.stringify(body),
      signal: abort.signal,
    });

    if (!response.ok) {
      const data = await parseErrorBody(response);
      const retryAfter = parseRetryAfter(response, data);
      const message = envelopeMessage(data) || response.statusText || CLIENT_COPY.generic;

      if (response.status === 401 && message === AUTH_MESSAGES.NOT_AUTHENTICATED) {
        endSession({ redirect: true });
        throw new ApiError({ message: CLIENT_COPY.unauthorized, status: 401, data, retryAfter });
      }

      if (shouldRefresh(response.status, message, isRetry)) {
        try {
          await refreshSession();
          return streamChat(input, callbacks, { ...options, isRetry: true });
        } catch {
          endSession({ redirect: true });
          throw new ApiError({ message: CLIENT_COPY.unauthorized, status: 401, data, retryAfter });
        }
      }

      throw new ApiError({ message, status: response.status, data, retryAfter });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => null);
      const mapped = mapChatResponse(unwrapApiResponse(payload, 502));
      callbacks.onToken?.(mapped.content, mapped.content);
      callbacks.onComplete?.(mapped);
      return mapped;
    }

    const content = await readSseStream(response, { onToken: callbacks.onToken, signal: abort.signal });
    const result = { content, finishReason: "STOP", mode: body.mode };
    callbacks.onComplete?.(result);
    return result;
  } catch (err) {
    if (err?.name === "AbortError") {
      if (options.signal?.aborted && !abort.timedOut()) {
        const cancelled = new ApiError({ message: CLIENT_COPY.cancelled, status: 499, data: null });
        callbacks.onError?.(cancelled);
        throw cancelled;
      }
      const timeoutError = new ApiError({ message: CLIENT_COPY.timeout, status: 408, data: null });
      callbacks.onError?.(timeoutError);
      throw timeoutError;
    }
    const normalized = isApiError(err)
      ? err
      : new ApiError({ message: CLIENT_COPY.network, status: 0, data: null });
    callbacks.onError?.(normalized);
    throw normalized;
  } finally {
    abort.cleanup();
  }
}

const aiApi = {
  completeChat,
  streamChat,
  getResumeContextStatus,
  getAiHealth,
  getAiConfig,
  getAiMetadata,
  listSavedJobsForContext,
};

export default aiApi;
