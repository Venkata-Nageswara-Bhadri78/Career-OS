import { useCallback, useEffect, useMemo, useState } from "react";
import "../api/registerSessionBridge";
import authApi from "../api/authApi";
import { subscribeToSessionEnd } from "../api/authSession";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("booting");

  const becomeGuest = useCallback(() => {
    setUser(null);
    setStatus("guest");
  }, []);

  const refreshUser = useCallback(async () => {
    const current = await authApi.getCurrentUser();
    setUser(current);
    setStatus(current ? "authenticated" : "guest");
    return current;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const current = await authApi.initializeAuthentication();
      if (cancelled) return;
      setUser(current);
      setStatus(current ? "authenticated" : "guest");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => subscribeToSessionEnd(becomeGuest), [becomeGuest]);

  const signIn = useCallback(
    async (payload) => {
      await authApi.login(payload);
      return refreshUser();
    },
    [refreshUser]
  );

  const signOut = useCallback(async () => {
    await authApi.logout();
    becomeGuest();
  }, [becomeGuest]);

  const signOutAll = useCallback(async () => {
    await authApi.logoutAll();
    becomeGuest();
  }, [becomeGuest]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isBooting: status === "booting",
      signIn,
      signOut,
      signOutAll,
      refreshUser,
    }),
    [user, status, signIn, signOut, signOutAll, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
