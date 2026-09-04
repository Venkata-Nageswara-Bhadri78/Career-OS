import { API_BASE_URL, INTERNAL_API_HEADER, INTERNAL_API_PREFIX } from "./apiConfig";
import { ApiError, AUTH_MESSAGES, CLIENT_COPY, isApiError } from "./apiError";
import { endSession, getAuthorizationHeader, isPublicEndpoint, refreshSession } from "./sessionBridge";

const DEFAULT_TIMEOUT_MS = 30_000;

export function buildUrl(endpoint, query = {}) {
  const url = new URL(endpoint, `${API_BASE_URL}/`);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
    else url.searchParams.append(key, value);
  });
  return url.toString();
}

function normalizePath(endpoint) {
  const raw = String(endpoint || "").split("?")[0];
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      return new URL(raw).pathname;
    } catch {
      return raw;
    }
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function assertBrowserSafeEndpoint(endpoint) {
  const path = normalizePath(endpoint).toLowerCase();
  if (path === INTERNAL_API_PREFIX || path.startsWith(`${INTERNAL_API_PREFIX}/`)) {
    throw new ApiError({ message: CLIENT_COPY.blocked, status: 403, data: null });
  }
}

function sanitizeHeaders(headers = {}) {
  const next = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key.toLowerCase() === INTERNAL_API_HEADER.toLowerCase()) return;
    next[key] = value;
  });
  return next;
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

async function parseBody(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  if (contentType.includes("text/")) {
    return response.text().catch(() => null);
  }
  return null;
}

function toApiError(error) {
  if (isApiError(error)) return error;
  if (error?.name === "AbortError") {
    return new ApiError({ message: CLIENT_COPY.timeout, status: 408, data: null });
  }
  return new ApiError({
    message: CLIENT_COPY.network,
    status: 0,
    data: null,
  });
}

function shouldHardLogout(status, message) {
  return status === 401 && message === AUTH_MESSAGES.NOT_AUTHENTICATED;
}

function shouldRefresh({ endpoint, skipRefresh, isRetry, status, message }) {
  if (skipRefresh || isRetry || status !== 401) return false;
  if (isPublicEndpoint(endpoint)) return false;
  if (message === AUTH_MESSAGES.NOT_AUTHENTICATED) return false;
  if (message === AUTH_MESSAGES.INVALID_INTERNAL_KEY) return false;
  if (message === AUTH_MESSAGES.INVALID_LOGIN) return false;
  return message === AUTH_MESSAGES.UNAUTHORIZED || message === "";
}

function composeAbortSignal(userSignal, timeoutMs) {
  const timeoutController = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, timeoutMs);

  const signals = [timeoutController.signal];
  if (userSignal) signals.push(userSignal);

  let signal = timeoutController.signal;
  let abortListener = null;
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.any === "function") {
    signal = AbortSignal.any(signals);
  } else if (userSignal) {
    const merged = new AbortController();
    abortListener = () => merged.abort();
    if (userSignal.aborted || timeoutController.signal.aborted) merged.abort();
    else {
      userSignal.addEventListener("abort", abortListener);
      timeoutController.signal.addEventListener("abort", abortListener);
    }
    signal = merged.signal;
  }

  return {
    signal,
    timedOut: () => timedOut,
    cleanup: () => {
      clearTimeout(timer);
      if (abortListener && userSignal) userSignal.removeEventListener("abort", abortListener);
    },
  };
}

function unauthorizedError(data, retryAfter) {
  return new ApiError({
    message: CLIENT_COPY.unauthorized,
    status: 401,
    data,
    retryAfter,
  });
}

export async function request({
  endpoint,
  method = "GET",
  body = null,
  headers = {},
  query = {},
  timeout = DEFAULT_TIMEOUT_MS,
  signal,
  skipAuth = false,
  skipRefresh = false,
  isRetry = false,
}) {
  assertBrowserSafeEndpoint(endpoint);

  const abort = composeAbortSignal(signal, timeout);
  const bearerToken = skipAuth ? null : getAuthorizationHeader();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const reqHeaders = sanitizeHeaders({
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(bearerToken ? { Authorization: bearerToken } : {}),
    ...headers,
  });

  if (isFormData) {
    delete reqHeaders["Content-Type"];
  }

  let serializedBody = null;
  if (body !== null && body !== undefined) {
    serializedBody = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(buildUrl(endpoint, query), {
      method,
      headers: reqHeaders,
      body: serializedBody,
      signal: abort.signal,
    });

    const data = await parseBody(response);
    if (response.ok) return data;

    const retryAfter = parseRetryAfter(response, data);
    const message = envelopeMessage(data) || response.statusText || CLIENT_COPY.generic;
    const error = new ApiError({ message, status: response.status, data, retryAfter });

    if (shouldHardLogout(response.status, message)) {
      endSession({ redirect: true });
      throw unauthorizedError(data, retryAfter);
    }

    if (shouldRefresh({ endpoint, skipRefresh, isRetry, status: response.status, message })) {
      try {
        await refreshSession();
        return request({
          endpoint,
          method,
          body,
          headers,
          query,
          timeout,
          signal,
          skipAuth,
          skipRefresh,
          isRetry: true,
        });
      } catch {
        endSession({ redirect: true });
        throw unauthorizedError(data, retryAfter);
      }
    }

    throw error;
  } catch (err) {
    if (err?.name === "AbortError") {
      if (signal?.aborted && !abort.timedOut()) {
        throw new ApiError({ message: CLIENT_COPY.cancelled, status: 499, data: null });
      }
      throw new ApiError({ message: CLIENT_COPY.timeout, status: 408, data: null });
    }
    throw toApiError(err);
  } finally {
    abort.cleanup();
  }
}

export const get = (endpoint, query, options) => request({ endpoint, method: "GET", query, ...options });
export const post = (endpoint, body, options) => request({ endpoint, method: "POST", body, ...options });
export const put = (endpoint, body, options) => request({ endpoint, method: "PUT", body, ...options });
export const patch = (endpoint, body, options) => request({ endpoint, method: "PATCH", body, ...options });
export const del = (endpoint, options) => request({ endpoint, method: "DELETE", ...options });

export async function upload(endpoint, formData, options = {}) {
  return request({
    endpoint,
    method: options.method || "POST",
    body: formData,
    ...options,
  });
}

export async function download(endpoint, options = {}) {
  assertBrowserSafeEndpoint(endpoint);

  const abort = composeAbortSignal(options.signal, options.timeout ?? DEFAULT_TIMEOUT_MS);
  const bearerToken = options.skipAuth ? null : getAuthorizationHeader();

  try {
    const response = await fetch(buildUrl(endpoint, options.query), {
      method: options.method || "GET",
      headers: sanitizeHeaders({
        ...(bearerToken ? { Authorization: bearerToken } : {}),
        ...(options.headers ?? {}),
      }),
      signal: abort.signal,
    });

    const messagePeek = async () => {
      const data = await parseBody(response.clone ? response.clone() : response);
      return { data, message: envelopeMessage(data), retryAfter: parseRetryAfter(response, data) };
    };

    if (!response.ok) {
      const { data, message, retryAfter } = await messagePeek();

      if (shouldHardLogout(response.status, message)) {
        endSession({ redirect: true });
        throw unauthorizedError(data, retryAfter);
      }

      if (
        shouldRefresh({
          endpoint,
          skipRefresh: options.skipRefresh,
          isRetry: options.isRetry,
          status: response.status,
          message,
        })
      ) {
        try {
          await refreshSession();
          return download(endpoint, { ...options, isRetry: true });
        } catch {
          endSession({ redirect: true });
          throw unauthorizedError(data, retryAfter);
        }
      }

      throw new ApiError({
        message: message || response.statusText || CLIENT_COPY.generic,
        status: response.status,
        data,
        retryAfter,
      });
    }

    return response;
  } catch (err) {
    if (err?.name === "AbortError") {
      if (options.signal?.aborted && !abort.timedOut()) {
        throw new ApiError({ message: CLIENT_COPY.cancelled, status: 499, data: null });
      }
      throw new ApiError({ message: CLIENT_COPY.timeout, status: 408, data: null });
    }
    throw toApiError(err);
  } finally {
    abort.cleanup();
  }
}

const httpClient = { request, get, post, put, patch, delete: del, upload, download, buildUrl };
export default httpClient;
