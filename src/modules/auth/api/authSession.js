import { API_BASE_URL } from "../../../common/api/apiConfig";
import { AUTH_ENDPOINTS } from "./authEndpoints";
import { AUTH_PATHS, isAuthPublicPath } from "../config/authConfig";
import { mapAuthTokens } from "../mappers/authMapper";
import { clearTokens, getRefreshToken, saveTokens } from "./tokenStorage";

const SESSION_ENDED_EVENT = "career-os:auth-session-ended";

let refreshPromise = null;

function parseRetryAfter(response) {
  const header = response.headers.get("Retry-After");
  if (!header) return null;
  const seconds = Number.parseInt(header, 10);
  return Number.isFinite(seconds) ? seconds : null;
}

async function parseJson(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  return null;
}

export async function refreshSession() {
  if (refreshPromise) return refreshPromise;

  const run = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw Object.assign(new Error("Refresh token not found."), { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await parseJson(response);
    if (!response.ok) {
      const error = new Error(payload?.message || "Invalid refresh token.");
      error.status = response.status;
      error.retryAfter = parseRetryAfter(response);
      error.data = payload;
      throw error;
    }

    const tokens = mapAuthTokens(payload?.data);
    if (!tokens) {
      throw Object.assign(new Error("Invalid refresh token."), { status: 401 });
    }
    saveTokens(tokens);
    return tokens;
  };

  const execute = () => {
    if (typeof navigator !== "undefined" && navigator.locks?.request) {
      return navigator.locks.request("career-os-auth-refresh", run);
    }
    return run();
  };

  refreshPromise = execute().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function endSession({ redirect = true } = {}) {
  clearTokens();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SESSION_ENDED_EVENT));
  if (!redirect) return;
  const path = window.location.pathname;
  if (isAuthPublicPath(path) || path === AUTH_PATHS.LANDING) return;
  window.location.assign(AUTH_PATHS.LOGIN);
}

export function subscribeToSessionEnd(handler) {
  if (typeof window === "undefined") return () => {};
  const listener = () => handler();
  window.addEventListener(SESSION_ENDED_EVENT, listener);
  return () => window.removeEventListener(SESSION_ENDED_EVENT, listener);
}
