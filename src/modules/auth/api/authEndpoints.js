import { API_BASE_URL } from "../../../common/api/apiConfig";

export { API_BASE_URL };

export const AUTH_BASE_PATH = "/api/v1/auth";

export const AUTH_ENDPOINTS = Object.freeze({
  REGISTER: `${AUTH_BASE_PATH}/register`,
  LOGIN: `${AUTH_BASE_PATH}/login`,
  VERIFY_EMAIL: `${AUTH_BASE_PATH}/verify-email`,
  RESEND_OTP: `${AUTH_BASE_PATH}/resend-otp`,
  FORGOT_PASSWORD: `${AUTH_BASE_PATH}/forgot-password`,
  RESET_PASSWORD: `${AUTH_BASE_PATH}/reset-password`,
  REFRESH_TOKEN: `${AUTH_BASE_PATH}/refresh-token`,
  CURRENT_USER: `${AUTH_BASE_PATH}/me`,
  LOGOUT: `${AUTH_BASE_PATH}/logout`,
  LOGOUT_ALL: `${AUTH_BASE_PATH}/logout-all`,
});

export const AUTH_PUBLIC_ENDPOINTS = Object.freeze([
  AUTH_ENDPOINTS.REGISTER,
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.VERIFY_EMAIL,
  AUTH_ENDPOINTS.RESEND_OTP,
  AUTH_ENDPOINTS.FORGOT_PASSWORD,
  AUTH_ENDPOINTS.RESET_PASSWORD,
  AUTH_ENDPOINTS.REFRESH_TOKEN,
]);

export function isAuthPublicEndpoint(endpoint) {
  if (!endpoint) return false;
  const path = String(endpoint).split("?")[0];
  return AUTH_PUBLIC_ENDPOINTS.some((item) => path === item || path.endsWith(item));
}

export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export default AUTH_ENDPOINTS;
