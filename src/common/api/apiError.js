export const CLIENT_COPY = Object.freeze({
  timeout: "Request timed out. Please try again.",
  network: "Unable to reach the server. Please try again.",
  generic: "Something went wrong.",
  unauthorized: "Your session has ended. Please sign in again.",
  cancelled: "Request cancelled.",
  blocked: "This request is not available.",
});

export const AUTH_MESSAGES = Object.freeze({
  UNAUTHORIZED: "Unauthorized.",
  NOT_AUTHENTICATED: "User is not authenticated.",
  INVALID_INTERNAL_KEY: "Invalid or missing internal service key.",
  INVALID_LOGIN: "Invalid email or password.",
});

export class ApiError extends Error {
  constructor({ message, status, data = null, retryAfter = null }) {
    super(message || CLIENT_COPY.generic);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.retryAfter = retryAfter;
  }
}

export function isApiError(error) {
  return error instanceof ApiError || error?.name === "ApiError";
}
