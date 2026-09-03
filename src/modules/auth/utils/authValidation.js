import { AUTH_CONFIG, PASSWORD_SPECIAL_PATTERN } from "../config/authConfig";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function normalizeUsername(username) {
  return String(username ?? "").trim().toLowerCase();
}

export function normalizeFullName(fullName) {
  return String(fullName ?? "").trim();
}

export function normalizeOtp(otp) {
  return String(otp ?? "").replace(/\D/g, "").slice(0, AUTH_CONFIG.otpLength);
}

export function normalizeResetToken(token) {
  return String(token ?? "").trim().slice(0, AUTH_CONFIG.resetTokenMax);
}

export function isValidEmail(email) {
  const value = normalizeEmail(email);
  return value.length > 0 && value.length <= AUTH_CONFIG.emailMax && EMAIL_PATTERN.test(value);
}

export function validateUsername(username) {
  const value = normalizeUsername(username);
  if (!value) return "Username is required.";
  if (value.length < AUTH_CONFIG.usernameMin || value.length > AUTH_CONFIG.usernameMax) {
    return `Username must be ${AUTH_CONFIG.usernameMin}–${AUTH_CONFIG.usernameMax} characters.`;
  }
  return "";
}

export function validateFullName(fullName) {
  const value = normalizeFullName(fullName);
  if (!value) return "Full name is required.";
  if (value.length < AUTH_CONFIG.fullNameMin || value.length > AUTH_CONFIG.fullNameMax) {
    return `Full name must be ${AUTH_CONFIG.fullNameMin}–${AUTH_CONFIG.fullNameMax} characters.`;
  }
  return "";
}

export function validateEmail(email) {
  const value = normalizeEmail(email);
  if (!value) return "Email is required.";
  if (value.length > AUTH_CONFIG.emailMax) return "Email is too long.";
  if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address.";
  return "";
}

export function validatePassword(password, { forLogin = false } = {}) {
  const value = String(password ?? "");
  if (!value) return "Password is required.";
  if (value.length > AUTH_CONFIG.passwordMax) return "Password is too long.";
  if (forLogin) return "";
  if (value.length < AUTH_CONFIG.passwordMin) {
    return `Password must be at least ${AUTH_CONFIG.passwordMin} characters.`;
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value) || !PASSWORD_SPECIAL_PATTERN.test(value)) {
    return `Password must include upper, lower, a number, and a special character (${AUTH_CONFIG.specialChars}).`;
  }
  return "";
}

export function validateOtp(otp) {
  const value = normalizeOtp(otp);
  if (value.length !== AUTH_CONFIG.otpLength) return "Enter the 6-digit code from your email.";
  return "";
}

export function validateResetToken(token) {
  const value = normalizeResetToken(token);
  if (!value) return "Reset token is required.";
  if (value.length > AUTH_CONFIG.resetTokenMax) return "Reset token is invalid.";
  return "";
}

export function validateRegisterForm(form) {
  const fieldErrors = {
    email: validateEmail(form.email),
    username: validateUsername(form.username),
    fullName: validateFullName(form.fullName),
    password: validatePassword(form.password),
  };
  return compactErrors(fieldErrors);
}

export function validateLoginForm(form) {
  const fieldErrors = {
    email: validateEmail(form.email),
    password: validatePassword(form.password, { forLogin: true }),
  };
  return compactErrors(fieldErrors);
}

export function validateForgotPasswordForm(form) {
  return compactErrors({ email: validateEmail(form.email) });
}

export function validateResetPasswordForm(form) {
  const fieldErrors = {
    token: validateResetToken(form.token),
    newPassword: validatePassword(form.newPassword),
    confirmPassword: form.newPassword !== form.confirmPassword ? "Passwords do not match." : "",
  };
  return compactErrors(fieldErrors);
}

export function validateVerifyEmailForm(form) {
  return compactErrors({
    email: validateEmail(form.email),
    otp: validateOtp(form.otp),
  });
}

function compactErrors(fieldErrors) {
  const next = {};
  Object.entries(fieldErrors).forEach(([key, value]) => {
    if (value) next[key] = value;
  });
  return next;
}

export function parseBackendFieldErrors(message) {
  if (!message || typeof message !== "string") return {};
  const fieldErrors = {};
  message.split(",").forEach((part) => {
    const index = part.indexOf(":");
    if (index === -1) return;
    const field = part.slice(0, index).trim();
    const reason = part.slice(index + 1).trim();
    if (field && reason && /^[A-Za-z]+$/.test(field)) {
      fieldErrors[field] = reason;
    }
  });
  return fieldErrors;
}
