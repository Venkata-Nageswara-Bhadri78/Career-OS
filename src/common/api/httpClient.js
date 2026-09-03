import { API_BASE_URL } from "./apiConfig";
import { getAuthorizationHeader } from "../../modules/auth/api/tokenStorage";
import { endSession, refreshSession } from "../../modules/auth/api/authSession";
import { isAuthPublicEndpoint } from "../../modules/auth/api/authEndpoints";

const CLIENT_COPY = Object.freeze({
  timeout: "Request timed out. Please try again.",
  network: "Unable to reach the server. Please try again.",
  generic: "Something went wrong.",
  unauthorized: "Your session has ended. Please sign in again.",
});

export class ApiError extends Error {
  constructor({ message, status, data, retryAfter = null }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.retryAfter = retryAfter;
  }
}

export function buildUrl(endpoint, query = {}) {
  const url = new URL(endpoint, API_BASE_URL);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
    else url.searchParams.append(key, value);
  });
  return url.toString();
}

function parseRetryAfter(response, data) {
  const header = response.headers.get("Retry-After");
  if (header) {
    const seconds = Number.parseInt(header, 10);
    if (Number.isFinite(seconds)) return seconds;
  }
  const fromBody = data?.retryAfter ?? data?.data?.retryAfter;
  return Number.isFinite(fromBody) ? fromBody : null;
}

async function parseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  if (contentType.includes("text/")) {
    return response.text().catch(() => null);
  }
  return null;
}

function toApiError(error, fallbackStatus = 500) {
  if (error instanceof ApiError) return error;
  if (error?.name === "AbortError") {
    return new ApiError({ message: CLIENT_COPY.timeout, status: 408, data: null });
  }
  return new ApiError({
    message: CLIENT_COPY.network,
    status: fallbackStatus,
    data: null,
  });
}

function shouldRefresh(endpoint, skipRefresh, isRetry, status) {
  if (skipRefresh || isRetry || status !== 401) return false;
  return !isAuthPublicEndpoint(endpoint);
}

export async function request({
  endpoint,
  method = "GET",
  body = null,
  headers = {},
  query = {},
  timeout = 30000,
  signal,
  skipAuth = false,
  skipRefresh = false,
  isRetry = false,
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const bearerToken = skipAuth ? null : getAuthorizationHeader();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const reqHeaders = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(bearerToken ? { Authorization: bearerToken } : {}),
    ...headers,
  };

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
      signal: signal ?? controller.signal,
    });

    const data = await parseBody(response);
    if (response.ok) return data;

    const retryAfter = parseRetryAfter(response, data);
    const message = data?.message || response.statusText || CLIENT_COPY.generic;
    const error = new ApiError({ message, status: response.status, data, retryAfter });

    if (shouldRefresh(endpoint, skipRefresh, isRetry, response.status)) {
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
        throw new ApiError({
          message: CLIENT_COPY.unauthorized,
          status: 401,
          data,
          retryAfter,
        });
      }
    }

    throw error;
  } catch (err) {
    throw toApiError(err);
  } finally {
    clearTimeout(timer);
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout ?? 30000);
  const bearerToken = options.skipAuth ? null : getAuthorizationHeader();

  try {
    const response = await fetch(buildUrl(endpoint, options.query), {
      method: options.method || "GET",
      headers: {
        ...(bearerToken ? { Authorization: bearerToken } : {}),
        ...(options.headers ?? {}),
      },
      signal: options.signal ?? controller.signal,
    });

    if (response.status === 401 && !options.skipRefresh && !options.isRetry && !isAuthPublicEndpoint(endpoint)) {
      try {
        await refreshSession();
        return download(endpoint, { ...options, isRetry: true });
      } catch {
        endSession({ redirect: true });
        throw new ApiError({ message: CLIENT_COPY.unauthorized, status: 401, data: null });
      }
    }

    if (!response.ok) {
      const data = await parseBody(response);
      throw new ApiError({
        message: data?.message || response.statusText || CLIENT_COPY.generic,
        status: response.status,
        data,
        retryAfter: parseRetryAfter(response, data),
      });
    }

    return response;
  } catch (err) {
    throw toApiError(err);
  } finally {
    clearTimeout(timer);
  }
}

const httpClient = { request, get, post, put, patch, delete: del, upload, download, buildUrl };
export default httpClient;
