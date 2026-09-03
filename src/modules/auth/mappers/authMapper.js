import { AUTH_COPY } from "../utils/authMessages";
import { parseBackendFieldErrors } from "../utils/authValidation";

export function mapAuthTokens(data) {
  if (!data || typeof data !== "object") return null;
  const accessToken = data.accessToken;
  const refreshToken = data.refreshToken;
  if (!accessToken || !refreshToken) return null;
  return {
    accessToken,
    refreshToken,
    tokenType: data.tokenType || "Bearer",
  };
}

export function mapCurrentUser(data) {
  if (!data || typeof data !== "object") return null;
  return {
    id: data.id,
    username: data.username ?? "",
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    role: data.role ?? "USER",
  };
}

export function mapAuthError(error) {
  const status = error?.status ?? 500;
  const retryAfter = Number.isFinite(error?.retryAfter) ? error.retryAfter : null;
  const rawMessage = typeof error?.message === "string" ? error.message : "";
  const fieldErrors = parseBackendFieldErrors(rawMessage);

  let message = AUTH_COPY.genericError;
  if (status === 0 || status === 500 && /failed to fetch|network/i.test(rawMessage)) {
    message = AUTH_COPY.networkError;
  } else if (status === 408) {
    message = AUTH_COPY.timeoutError;
  } else if (status === 429) {
    message = AUTH_COPY.rateLimited;
  } else if (status === 503) {
    message = AUTH_COPY.mailUnavailable;
  } else if (status === 401) {
    const lower = rawMessage.toLowerCase();
    if (lower.includes("refresh token")) {
      message = AUTH_COPY.sessionReuse;
    } else if (lower.includes("invalid email or password")) {
      message = AUTH_COPY.loginGenericFailure;
    } else if (lower.includes("unauthorized")) {
      message = AUTH_COPY.unauthorized;
    } else {
      message = AUTH_COPY.loginGenericFailure;
    }
  } else if (status === 400 && rawMessage) {
    message = rawMessage;
  } else if (rawMessage && status < 500) {
    message = rawMessage;
  }

  return {
    status,
    message,
    fieldErrors,
    retryAfter,
  };
}
