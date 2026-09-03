import { API_BASE_URL } from "./jobExtractionEndpoints";
import { getAuthorizationHeader, getAccessToken } from "../../auth/api/tokenStorage";

export class ApiError extends Error {
  constructor({ message, status, data }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function buildUrl(endpoint, query = {}) {
  const url = new URL(endpoint, API_BASE_URL);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      Array.isArray(v) ? v.forEach((i) => url.searchParams.append(k, i)) : url.searchParams.append(k, v);
    }
  });
  return url.toString();
}

function resolveBearerToken() {
  const authHeader = getAuthorizationHeader();
  if (authHeader) return authHeader;

  const rawToken =
    getAccessToken() ||
    localStorage.getItem("auth_access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("auth_access_token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token");

  if (!rawToken) return null;
  const trimmed = String(rawToken).trim();
  return trimmed.startsWith("Bearer ") || trimmed.startsWith("bearer ") ? trimmed : `Bearer ${trimmed}`;
}

export async function request({ endpoint, method = "GET", body = null, headers = {}, query = {}, timeout = 30000, signal }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const bearerToken = resolveBearerToken();

  const reqHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(bearerToken ? { Authorization: bearerToken } : {}),
    ...headers,
  };

  try {
    const res = await fetch(buildUrl(endpoint, query), {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : null,
      signal: signal ?? controller.signal,
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        throw new ApiError({
          message: data?.message || (res.status === 403 ? "Forbidden: You are not authorized or your session has expired." : "Unauthorized: Please log in again."),
          status: res.status,
          data,
        });
      }
      throw new ApiError({ message: data?.message || res.statusText, status: res.status, data });
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") throw new ApiError({ message: "Request timed out.", status: 408, data: null });
    throw new ApiError({ message: err.message || "Network error occurred.", status: 500, data: null });
  } finally {
    clearTimeout(timer);
  }
}

export const get = (endpoint, query, options) => request({ endpoint, method: "GET", query, ...options });
export const post = (endpoint, body, options) => request({ endpoint, method: "POST", body, ...options });
export const put = (endpoint, body, options) => request({ endpoint, method: "PUT", body, ...options });
export const patch = (endpoint, body, options) => request({ endpoint, method: "PATCH", body, ...options });
export const del = (endpoint, options) => request({ endpoint, method: "DELETE", ...options });

const jobExtractionClient = { request, get, post, put, patch, delete: del, buildUrl };
export default jobExtractionClient;
