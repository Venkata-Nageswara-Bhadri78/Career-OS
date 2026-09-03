import { useCallback, useMemo, useState } from "react";
import { ThemeContext } from "./themeContext";
import {
  applyTheme,
  getThemeById,
  persistThemeId,
  readStoredThemeId,
  THEME_OPTIONS,
} from "./themeConfig";

export default function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(readStoredThemeId);

  const setTheme = useCallback((nextId) => {
    const resolved = getThemeById(nextId).id;
    setThemeId(resolved);
    persistThemeId(resolved);
    applyTheme(resolved);
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      theme: getThemeById(themeId),
      themes: THEME_OPTIONS,
      setTheme,
    }),
    [themeId, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
