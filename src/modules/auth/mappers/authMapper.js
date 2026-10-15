import { AUTH_MESSAGES } from "../../../common/api/apiError";
import { AUTH_COPY } from "../utils/authMessages";
import { parseBackendFieldErrors } from "../utils/authValidation";

export function mapAuthTokens(data) {
  if (!data || typeof data !== "object") return null;
  const accessToken = data.accessToken;
  const refreshToken = data.refreshToken;
  if (!accessToken || !refreshToken) return null;
  const tokens = {
    accessToken,
    refreshToken,
    tokenType: data.tokenType || "Bearer",
  };
  if (typeof data.onboardingComplete === "boolean") {
    tokens.onboardingComplete = data.onboardingComplete;
  }
  return tokens;
}

export function mapCurrentUser(data) {
  if (!data || typeof data !== "object") return null;
  const username = typeof data.username === "string" ? data.username.trim() : "";
  return {
    id: data.id,
    username: username || null,
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    role: data.role ?? "USER",
    passwordConfigured: data.passwordConfigured === true,
    googleLinked: data.googleLinked === true,
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
    if (rawMessage === AUTH_MESSAGES.INVALID_GOOGLE_TOKEN || rawMessage === AUTH_MESSAGES.ACCOUNT_DISABLED) {
      message = rawMessage;
    } else if (lower.includes("refresh token")) {
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
