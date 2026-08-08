export const STORAGE_KEYS = Object.freeze({
    ACCESS_TOKEN: "auth_access_token",
    REFRESH_TOKEN: "auth_refresh_token",
    TOKEN_TYPE: "auth_token_type",
});

export const saveTokens = ({ accessToken, refreshToken, tokenType = "Bearer" }) => {
    if (accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("token", accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, tokenType);
};

export const getAccessToken = () => {
    return (
        localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt") ||
        sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        null
    );
};

export const getRefreshToken = () => {
    return (
        localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
        localStorage.getItem("refreshToken") ||
        sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
        sessionStorage.getItem("refreshToken") ||
        null
    );
};

export const getTokenType = () => localStorage.getItem(STORAGE_KEYS.TOKEN_TYPE) || "Bearer";

export const getAuthorizationHeader = () => {
    const token = getAccessToken();
    if (!token) return null;
    const trimmed = String(token).trim();
    if (trimmed.startsWith("Bearer ") || trimmed.startsWith("bearer ")) {
        return trimmed;
    }
    // return `${getTokenType()} ${trimmed}`;
    return `Bearer ${trimmed}`;
};

export const isAuthenticated = () => Boolean(getAccessToken());
export const hasRefreshToken = () => Boolean(getRefreshToken());

export const removeAccessToken = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("token");
};

export const removeRefreshToken = () => {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem("refreshToken");
};

export const clearTokens = () => {
    removeAccessToken();
    removeRefreshToken();
    localStorage.removeItem(STORAGE_KEYS.TOKEN_TYPE);
};

export const getStoredTokens = () => ({
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    tokenType: getTokenType(),
});
