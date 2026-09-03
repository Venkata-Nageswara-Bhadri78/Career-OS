const ACCESS_KEY = "career_os_access_token";
const REFRESH_KEY = "career_os_refresh_token";
const TYPE_KEY = "career_os_token_type";
const PERSIST_KEY = "career_os_persist_session";

const LEGACY_ACCESS_KEYS = [
  "auth_access_token",
  "accessToken",
  "token",
  "jwt",
];
const LEGACY_REFRESH_KEYS = ["auth_refresh_token", "refreshToken"];
const LEGACY_TYPE_KEYS = ["auth_token_type"];

let memoryAccessToken = null;
let memoryRefreshToken = null;
let memoryTokenType = "Bearer";

function canUseStorage() {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage && !!window.localStorage;
  } catch {
    return false;
  }
}

function isPersistEnabled() {
  if (!canUseStorage()) return false;
  return localStorage.getItem(PERSIST_KEY) === "1";
}

export function isSessionPersisted() {
  return isPersistEnabled();
}

function readFromStorages(key) {
  if (!canUseStorage()) return null;
  return sessionStorage.getItem(key) || localStorage.getItem(key);
}

function writeToken(key, value) {
  if (!canUseStorage()) return;
  const persist = isPersistEnabled();
  const primary = persist ? localStorage : sessionStorage;
  const secondary = persist ? sessionStorage : localStorage;
  if (value) primary.setItem(key, value);
  else primary.removeItem(key);
  secondary.removeItem(key);
}

function removeEverywhere(key) {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

function migrateLegacyTokens() {
  if (!canUseStorage()) return;
  const legacyAccess =
    memoryAccessToken ||
    LEGACY_ACCESS_KEYS.map((key) => localStorage.getItem(key) || sessionStorage.getItem(key)).find(Boolean);
  const legacyRefresh =
    memoryRefreshToken ||
    LEGACY_REFRESH_KEYS.map((key) => localStorage.getItem(key) || sessionStorage.getItem(key)).find(Boolean);
  const legacyType =
    LEGACY_TYPE_KEYS.map((key) => localStorage.getItem(key) || sessionStorage.getItem(key)).find(Boolean) || "Bearer";

  if (legacyAccess || legacyRefresh) {
    if (legacyAccess) memoryAccessToken = legacyAccess;
    if (legacyRefresh) memoryRefreshToken = legacyRefresh;
    memoryTokenType = legacyType;
    writeToken(ACCESS_KEY, memoryAccessToken);
    writeToken(REFRESH_KEY, memoryRefreshToken);
    writeToken(TYPE_KEY, memoryTokenType);
  }

  [...LEGACY_ACCESS_KEYS, ...LEGACY_REFRESH_KEYS, ...LEGACY_TYPE_KEYS].forEach(removeEverywhere);
}

migrateLegacyTokens();

export function setPersistSession(persist) {
  if (!canUseStorage()) return;
  if (persist) localStorage.setItem(PERSIST_KEY, "1");
  else localStorage.removeItem(PERSIST_KEY);

  writeToken(ACCESS_KEY, memoryAccessToken);
  writeToken(REFRESH_KEY, memoryRefreshToken);
  writeToken(TYPE_KEY, memoryTokenType);
}

export const saveTokens = ({ accessToken, refreshToken, tokenType = "Bearer" } = {}, options = {}) => {
  if (typeof options.persist === "boolean") {
    setPersistSession(options.persist);
  }
  if (accessToken) memoryAccessToken = accessToken;
  if (refreshToken) memoryRefreshToken = refreshToken;
  if (tokenType) memoryTokenType = tokenType;
  writeToken(ACCESS_KEY, memoryAccessToken);
  writeToken(REFRESH_KEY, memoryRefreshToken);
  writeToken(TYPE_KEY, memoryTokenType);
};

export const getAccessToken = () => {
  if (memoryAccessToken) return memoryAccessToken;
  const stored = readFromStorages(ACCESS_KEY);
  if (stored) memoryAccessToken = stored;
  return memoryAccessToken;
};

export const getRefreshToken = () => {
  if (memoryRefreshToken) return memoryRefreshToken;
  const stored = readFromStorages(REFRESH_KEY);
  if (stored) memoryRefreshToken = stored;
  return memoryRefreshToken;
};

export const getTokenType = () => {
  if (memoryTokenType) return memoryTokenType;
  memoryTokenType = readFromStorages(TYPE_KEY) || "Bearer";
  return memoryTokenType;
};

export const getAuthorizationHeader = () => {
  const token = getAccessToken();
  if (!token) return null;
  const trimmed = String(token).trim();
  if (!trimmed) return null;
  if (/^bearer\s+/i.test(trimmed)) return `Bearer ${trimmed.replace(/^bearer\s+/i, "")}`;
  return `Bearer ${trimmed}`;
};

export const isAuthenticated = () => Boolean(getAccessToken());
export const hasRefreshToken = () => Boolean(getRefreshToken());
export const hasSession = () => Boolean(getAccessToken() || getRefreshToken());

export const removeAccessToken = () => {
  memoryAccessToken = null;
  removeEverywhere(ACCESS_KEY);
};

export const removeRefreshToken = () => {
  memoryRefreshToken = null;
  removeEverywhere(REFRESH_KEY);
};

export const clearTokens = () => {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  memoryTokenType = "Bearer";
  removeEverywhere(ACCESS_KEY);
  removeEverywhere(REFRESH_KEY);
  removeEverywhere(TYPE_KEY);
};

export const getStoredTokens = () => ({
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  tokenType: getTokenType(),
});

export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: ACCESS_KEY,
  REFRESH_TOKEN: REFRESH_KEY,
  TOKEN_TYPE: TYPE_KEY,
});
