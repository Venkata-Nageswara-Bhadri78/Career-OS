import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "../config/appPaths";
import { useShellSession } from "../session/useShellSession";
import { useTheme } from "../theme/useTheme";

export function useSettings() {
  const { user, signOut, signOutAll } = useShellSession();
  const { themeId, themes, setTheme } = useTheme();
  const navigate = useNavigate();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const afterLogout = () => navigate(APP_PATHS.LOGIN, { replace: true });

  const handleLogout = async () => {
    setBusy("logout");
    setError("");
    try {
      await signOut();
    } catch {
      setError("Unable to sign out right now. Your local session was cleared.");
    } finally {
      setBusy("");
      afterLogout();
    }
  };

  const handleLogoutAll = async () => {
    setBusy("logout-all");
    setError("");
    try {
      await signOutAll();
    } catch {
      setError("Unable to sign out of every device right now. This browser was signed out.");
    } finally {
      setBusy("");
      afterLogout();
    }
  };

  return {
    user,
    themeId,
    themes,
    setTheme,
    busy,
    error,
    handleLogout,
    handleLogoutAll,
  };
}
