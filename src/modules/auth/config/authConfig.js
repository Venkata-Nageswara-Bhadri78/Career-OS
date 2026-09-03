export const AUTH_PATHS = Object.freeze({
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
});

export const AUTH_PUBLIC_PATHS = Object.freeze([
  AUTH_PATHS.LOGIN,
  AUTH_PATHS.REGISTER,
  AUTH_PATHS.SIGNUP,
  AUTH_PATHS.FORGOT_PASSWORD,
  AUTH_PATHS.RESET_PASSWORD,
  AUTH_PATHS.VERIFY_EMAIL,
]);

export const AUTH_GUEST_ONLY_PATHS = Object.freeze([
  AUTH_PATHS.LOGIN,
  AUTH_PATHS.REGISTER,
  AUTH_PATHS.SIGNUP,
  AUTH_PATHS.FORGOT_PASSWORD,
]);

export const AUTH_CONFIG = Object.freeze({
  usernameMin: 3,
  usernameMax: 50,
  fullNameMin: 3,
  fullNameMax: 100,
  emailMax: 255,
  passwordMin: 8,
  passwordMax: 72,
  otpLength: 6,
  resetTokenMax: 128,
  resendCooldownMs: 60_000,
  specialChars: "@$!%*?&#^+=",
  supportEmail: "support@career-os.app",
  instanceId: "9811",
  systemVersion: "04.9",
});

export const PASSWORD_SPECIAL_PATTERN = /[@$!%*?&#^+=]/;

export function isAuthPublicPath(pathname) {
  return AUTH_PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isGuestOnlyPath(pathname) {
  return AUTH_GUEST_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isSafeInternalPath(path) {
  if (typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  return true;
}
