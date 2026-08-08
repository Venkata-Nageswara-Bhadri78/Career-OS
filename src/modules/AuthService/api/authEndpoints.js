export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";
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

export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
export default AUTH_ENDPOINTS;