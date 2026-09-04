export const THEME_STORAGE_KEY = "career-os-theme";

export const THEME_OPTIONS = Object.freeze([
  { id: "ink", label: "Ink", ink: "#0a0a0a" },
  { id: "navy", label: "Navy", ink: "#0b1f3a" },
  { id: "charcoal", label: "Charcoal", ink: "#2c2c2c" },
  { id: "forest", label: "Forest", ink: "#14332b" },
  { id: "burgundy", label: "Burgundy", ink: "#3b1220" },
  { id: "slate", label: "Slate", ink: "#1e293b" },
  { id: "indigo", label: "Indigo", ink: "#1e1b4b" },
]);

export const DEFAULT_THEME_ID = "ink";
export const THEME_ACCENT = "#c9a227";
export const THEME_BG = "#ffffff";

export function getThemeById(id) {
  return THEME_OPTIONS.find((theme) => theme.id === id) ?? THEME_OPTIONS[0];
}

export function applyTheme(themeId) {
  if (typeof document === "undefined") return getThemeById(themeId);
  const theme = getThemeById(themeId);
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.style.setProperty("--theme-bg", THEME_BG);
  root.style.setProperty("--theme-ink", theme.ink);
  root.style.setProperty("--theme-accent", THEME_ACCENT);
  return theme;
}

export function readStoredThemeId() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function persistThemeId(themeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    /* private mode */
  }
}
