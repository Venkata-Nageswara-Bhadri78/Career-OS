import { AUTH_ENDPOINTS } from "./authEndpoints";
import { publicRequest, protectedRequest, extractData, extractMessage, isSuccess } from "./apiClient";
import { saveTokens, clearTokens, getRefreshToken, isAuthenticated } from "./tokenStorage";

function requireValue(value, field) {
    if (value === undefined || value === null || value === "") throw new Error(`${field} is required.`);
}

function validateEmail(email) {
    requireValue(email, "Email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address.");
}

function validatePassword(password) {
    requireValue(password, "Password");
    if (password.length < 8) throw new Error("Password must contain at least 8 characters.");
}

function unwrap(response) {
    if (!isSuccess(response)) throw new Error(extractMessage(response) || "An unknown error occurred.");
    return extractData(response);
}

export async function register({ username, fullName, email, password }) {
    requireValue(username, "Username");
    requireValue(fullName, "Full Name");
    validateEmail(email);
    validatePassword(password);
    return unwrap(await publicRequest({ endpoint: AUTH_ENDPOINTS.REGISTER, method: "POST", body: { username, fullName, email, password } }));
}

export async function login({ email, password }) {
    validateEmail(email);
    validatePassword(password);
    const data = unwrap(await publicRequest({ endpoint: AUTH_ENDPOINTS.LOGIN, method: "POST", body: { email, password } }));
    saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken, tokenType: data.tokenType || "Bearer" });
    return data;
}

export async function verifyEmail({ email, otp }) {
    validateEmail(email);
    requireValue(otp, "OTP");
    return unwrap(await publicRequest({ endpoint: AUTH_ENDPOINTS.VERIFY_EMAIL, method: "POST", body: { email, otp } }));
}

export async function resendOtp({ email }) {
    validateEmail(email);
    return unwrap(await publicRequest({ endpoint: AUTH_ENDPOINTS.RESEND_OTP, method: "POST", body: { email } }));
}

export async function forgotPassword({ email }) {
    validateEmail(email);
    return unwrap(await publicRequest({ endpoint: AUTH_ENDPOINTS.FORGOT_PASSWORD, method: "POST", body: { email } }));
}

export async function resetPassword({ token, newPassword }) {
    requireValue(token, "Reset Token");
    validatePassword(newPassword);
    return unwrap(await publicRequest({ endpoint: AUTH_ENDPOINTS.RESET_PASSWORD, method: "POST", body: { token, newPassword } }));
}

export async function refreshToken() {
    const token = getRefreshToken();
    if (!token) throw new Error("Refresh token not found.");
    const data = unwrap(await publicRequest({ endpoint: AUTH_ENDPOINTS.REFRESH_TOKEN, method: "POST", body: { refreshToken: token } }));
    saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken || token, tokenType: data.tokenType || "Bearer" });
    return data;
}

export async function getCurrentUser() {
    return unwrap(await protectedRequest({ endpoint: AUTH_ENDPOINTS.CURRENT_USER, method: "GET" }));
}

export async function logout() {
    try {
        const token = getRefreshToken();
        if (token) {
            return unwrap(await protectedRequest({ endpoint: AUTH_ENDPOINTS.LOGOUT, method: "POST", body: { refreshToken: token } }));
        }
    } finally {
        clearTokens();
    }
}

export async function logoutAll() {
    try {
        return unwrap(await protectedRequest({ endpoint: AUTH_ENDPOINTS.LOGOUT_ALL, method: "POST" }));
    } finally {
        clearTokens();
    }
}

export const isLoggedIn = () => isAuthenticated();
export const hasValidSession = () => Boolean(getRefreshToken());

export async function initializeAuthentication() {
    if (!hasValidSession()) return null;
    try {
        await refreshToken();
        return await getCurrentUser();
    } catch {
        clearTokens();
        return null;
    }
}

const authApi = { register, login, verifyEmail, resendOtp, forgotPassword, resetPassword, refreshToken, getCurrentUser, logout, logoutAll, initializeAuthentication, isLoggedIn, hasValidSession };
export default authApi;