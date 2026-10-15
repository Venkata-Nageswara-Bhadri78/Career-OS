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
  COMPLETE_USERNAME: "Complete your username to continue.",
  USERNAME_ALREADY_SET: "Username is already set.",
  USERNAME_TAKEN: "Username is already taken.",
  INVALID_GOOGLE_TOKEN: "Invalid Google token.",
  ACCOUNT_DISABLED: "This account is disabled.",
  GOOGLE_EMAIL_EXISTS: "An account with this email already exists. Sign in with your email and password.",
  GOOGLE_LINKED: "Google account linked successfully.",
  GOOGLE_EMAIL_MISMATCH: "The Google account email does not match this account.",
  GOOGLE_LINKED_OTHER: "This Google account is already linked to another user.",
  GOOGLE_ALREADY_ON_USER: "A Google account is already linked to this user.",
  PASSWORD_CODE_SENT: "A verification code has been sent to your email.",
  PASSWORD_CODE_RECENT: "A verification code was sent recently. Use that code or wait before requesting another.",
});

export function isCompleteUsernameDenied(status, message) {
  return status === 403 && message === AUTH_MESSAGES.COMPLETE_USERNAME;
}

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
