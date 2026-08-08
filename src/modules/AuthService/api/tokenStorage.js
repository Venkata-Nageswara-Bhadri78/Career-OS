export const STORAGE_KEYS = Object.freeze({
    ACCESS_TOKEN: "auth_access_token",
    REFRESH_TOKEN: "auth_refresh_token",
    TOKEN_TYPE: "auth_token_type",
});

export const saveTokens = ({ accessToken, refreshToken, tokenType = "Bearer" }) => {
    if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, tokenType);
};

export const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
export const getRefreshToken = () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
export const getTokenType = () => localStorage.getItem(STORAGE_KEYS.TOKEN_TYPE) || "Bearer";

export const getAuthorizationHeader = () => {
    const token = getAccessToken();
    return token ? `${getTokenType()} ${token}` : null;
};

export const isAuthenticated = () => Boolean(getAccessToken());
export const hasRefreshToken = () => Boolean(getRefreshToken());

export const removeAccessToken = () => localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
export const removeRefreshToken = () => localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

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
