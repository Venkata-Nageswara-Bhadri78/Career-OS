import { useContext } from "react";
import { DEFAULT_THEME_ID, getThemeById, THEME_OPTIONS, applyTheme } from "./themeConfig";
import { ThemeContext } from "./themeContext";

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      themeId: DEFAULT_THEME_ID,
      theme: getThemeById(DEFAULT_THEME_ID),
      themes: THEME_OPTIONS,
      setTheme: applyTheme,
    };
  }
  return context;
}
