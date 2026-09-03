import { get, post } from "../../../common/api/httpClient";
import { AUTH_ENDPOINTS } from "./authEndpoints";
import { mapAuthError, mapAuthTokens, mapCurrentUser } from "../mappers/authMapper";
import {
  normalizeEmail,
  normalizeFullName,
  normalizeOtp,
  normalizeResetToken,
  normalizeUsername,
} from "../utils/authValidation";
import { clearTokens, getRefreshToken, hasRefreshToken, hasSession, isAuthenticated, saveTokens } from "./tokenStorage";
import { endSession, refreshSession } from "./authSession";

const publicOptions = { skipAuth: true, skipRefresh: true };

function unwrapSuccess(response) {
  if (response && response.success === false) {
    throw Object.assign(new Error(response.message || "Request failed."), {
      status: 400,
      data: response,
    });
  }
  return response;
}

function rethrow(error) {
  const mapped = mapAuthError(error);
  const next = new Error(mapped.message);
  next.status = mapped.status;
  next.fieldErrors = mapped.fieldErrors;
  next.retryAfter = mapped.retryAfter;
  next.data = error?.data ?? null;
  throw next;
}

export async function register({ username, fullName, email, password }) {
  try {
    const response = unwrapSuccess(
      await post(
        AUTH_ENDPOINTS.REGISTER,
        {
          username: normalizeUsername(username),
          fullName: normalizeFullName(fullName),
          email: normalizeEmail(email),
          password,
        },
        publicOptions
      )
    );
    return { message: response?.message, data: null };
  } catch (error) {
    rethrow(error);
  }
}

export async function login({ email, password, rememberMe = false }) {
  try {
    const response = unwrapSuccess(
      await post(
        AUTH_ENDPOINTS.LOGIN,
        { email: normalizeEmail(email), password },
        publicOptions
      )
    );
    const tokens = mapAuthTokens(response?.data);
    if (!tokens) throw Object.assign(new Error("Login successful, but tokens were missing."), { status: 500 });
    saveTokens(tokens, { persist: Boolean(rememberMe) });
    return tokens;
  } catch (error) {
    rethrow(error);
  }
}

export async function verifyEmail({ email, otp }) {
  try {
    const response = unwrapSuccess(
      await post(
        AUTH_ENDPOINTS.VERIFY_EMAIL,
        { email: normalizeEmail(email), otp: normalizeOtp(otp) },
        publicOptions
      )
    );
    return { message: response?.message, data: null };
  } catch (error) {
    rethrow(error);
  }
}

export async function resendOtp({ email }) {
  try {
    const response = unwrapSuccess(
      await post(AUTH_ENDPOINTS.RESEND_OTP, { email: normalizeEmail(email) }, publicOptions)
    );
    return { message: response?.message, data: null };
  } catch (error) {
    rethrow(error);
  }
}

export async function forgotPassword({ email }) {
  try {
    const response = unwrapSuccess(
      await post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email: normalizeEmail(email) }, publicOptions)
    );
    return { message: response?.message, data: null };
  } catch (error) {
    rethrow(error);
  }
}

export async function resetPassword({ token, newPassword }) {
  try {
    const response = unwrapSuccess(
      await post(
        AUTH_ENDPOINTS.RESET_PASSWORD,
        { token: normalizeResetToken(token), newPassword },
        publicOptions
      )
    );
    clearTokens();
    return { message: response?.message, data: null };
  } catch (error) {
    rethrow(error);
  }
}

export async function refreshToken() {
  try {
    return await refreshSession();
  } catch (error) {
    endSession({ redirect: false });
    rethrow(error);
  }
}

export async function getCurrentUser() {
  try {
    const response = unwrapSuccess(await get(AUTH_ENDPOINTS.CURRENT_USER));
    return mapCurrentUser(response?.data);
  } catch (error) {
    rethrow(error);
  }
}

export async function logout() {
  try {
    const token = getRefreshToken();
    if (token) {
      if (!isAuthenticated() && hasRefreshToken()) {
        await refreshSession();
      }
      await post(AUTH_ENDPOINTS.LOGOUT, { refreshToken: token });
    }
  } catch {
    /* local sign-out still proceeds */
  } finally {
    endSession({ redirect: false });
  }
}

export async function logoutAll() {
  try {
    if (!isAuthenticated() && hasRefreshToken()) {
      await refreshSession();
    }
    await post(AUTH_ENDPOINTS.LOGOUT_ALL, null);
  } catch {
    /* local sign-out still proceeds */
  } finally {
    endSession({ redirect: false });
  }
}

export async function initializeAuthentication() {
  if (!hasSession()) return null;
  try {
    if (!isAuthenticated() && hasRefreshToken()) {
      await refreshSession();
    }
    return await getCurrentUser();
  } catch {
    endSession({ redirect: false });
    return null;
  }
}

export const isLoggedIn = () => isAuthenticated();
export const hasValidSession = () => hasSession();

const authApi = {
  register,
  login,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
  getCurrentUser,
  logout,
  logoutAll,
  initializeAuthentication,
  isLoggedIn,
  hasValidSession,
};

export default authApi;
