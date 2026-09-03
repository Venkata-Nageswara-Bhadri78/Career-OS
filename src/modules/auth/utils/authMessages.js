export const AUTH_COPY = Object.freeze({
  registerSuccess:
    "If this email can be registered, a 6-digit code is on its way. Check your inbox, then verify to continue.",
  registerInboxHint:
    "Didn’t get a code? Wait a minute, then use Resend. A successful register does not mean this email was new.",
  verifySuccess: "Email verified. You can now sign in.",
  resendGeneric: "If the account requires verification, an OTP has been sent.",
  forgotGeneric: "If the account exists, a password reset email has been sent.",
  forgotHint: "The email contains a token to paste here. It is not a sign-in link.",
  resetSuccess: "Password reset successfully. Sign in with your new password. All other sessions were signed out.",
  resetUnverifiedHint: "Resetting a password does not verify your email. Verify first if you have not already.",
  loginUnverifiedHint: "New accounts must verify email before signing in.",
  loginGenericFailure: "Invalid email or password.",
  rateLimited: "Too many requests. Please try again later.",
  mailUnavailable: "Unable to send email. Please try again later.",
  genericError: "Something went wrong.",
  networkError: "Unable to reach the server. Please try again.",
  timeoutError: "Request timed out. Please try again.",
  unauthorized: "Your session has ended. Please sign in again.",
  sessionReuse: "This session is no longer valid. Please sign in again.",
});

export function isGenericLoginFailure(message) {
  const value = String(message ?? "").toLowerCase();
  return value.includes("invalid email or password");
}
