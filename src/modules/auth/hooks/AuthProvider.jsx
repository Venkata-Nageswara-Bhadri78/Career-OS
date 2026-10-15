import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../api/registerSessionBridge";
import authApi from "../api/authApi";
import { subscribeToOnboardingRequired, subscribeToSessionEnd } from "../api/authSession";
import { mintAndPushExtensionToken } from "../api/extensionTokenHandoff";
import { getOnboardingComplete, hasSession, setOnboardingComplete } from "../api/tokenStorage";
import { hasUsername } from "../utils/onboarding";
import { normalizeUsername } from "../utils/authValidation";
import { AuthContext } from "./authContext";

function incompleteUser(current) {
  return {
    id: current?.id ?? null,
    username: null,
    fullName: current?.fullName ?? "",
    email: current?.email ?? "",
    role: current?.role ?? "USER",
    passwordConfigured: current?.passwordConfigured === true,
    googleLinked: current?.googleLinked === true,
  };
}

export function AuthProvider({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("booting");
  const [usernameRequired, setUsernameRequired] = useState(false);

  const becomeGuest = useCallback(() => {
    setUser(null);
    setUsernameRequired(false);
    setStatus("guest");
  }, []);

  const refreshUser = useCallback(async () => {
    const current = await authApi.getCurrentUser();
    setUser(current);
    setUsernameRequired(Boolean(current) && !hasUsername(current));
    setStatus(current ? "authenticated" : "guest");
    if (current) setOnboardingComplete(hasUsername(current));
    return current;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const current = await authApi.initializeAuthentication();
      if (cancelled) return;
      setUser(current);
      setUsernameRequired(Boolean(current) && !hasUsername(current));
      setStatus(current ? "authenticated" : "guest");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => subscribeToSessionEnd(becomeGuest), [becomeGuest]);

  const onboardingCheck = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeToOnboardingRequired(() => {
      if (!hasSession() || onboardingCheck.current) return;
      onboardingCheck.current = true;
      void (async () => {
        let fetched = null;
        try {
          fetched = await authApi.getCurrentUser();
          if (cancelled || !hasSession()) return;
          if (hasUsername(fetched)) {
            setUser(fetched);
            setUsernameRequired(false);
            setOnboardingComplete(true);
            setStatus("authenticated");
            return;
          }
        } catch {
          if (cancelled || !hasSession()) return;
        } finally {
          onboardingCheck.current = false;
        }
        if (cancelled || !hasSession()) return;
        setUsernameRequired(true);
        setStatus("authenticated");
        setUser((current) => incompleteUser(fetched || current));
      })();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const needsUsername =
    status === "authenticated" &&
    (usernameRequired || (user ? !hasUsername(user) : getOnboardingComplete() === false));

  useEffect(() => {
    if (status !== "authenticated" || needsUsername) return undefined;
    void mintAndPushExtensionToken();
  }, [status, needsUsername, location.search]);

  const signIn = useCallback(
    async (payload) => {
      await authApi.login(payload);
      return refreshUser();
    },
    [refreshUser]
  );

  const signInWithGoogle = useCallback(
    async ({ idToken, rememberMe } = {}) => {
      const tokens = await authApi.signInWithGoogle({ idToken, rememberMe });
      try {
        return await refreshUser();
      } catch (error) {
        if (!hasSession()) throw error;
        if (tokens.onboardingComplete === false) {
          const incomplete = incompleteUser(null);
          setUsernameRequired(true);
          setUser(incomplete);
          setStatus("authenticated");
          return incomplete;
        }
        setUsernameRequired(false);
        setUser(null);
        setStatus("authenticated");
        return null;
      }
    },
    [refreshUser]
  );

  const finishUsername = useCallback(
    async (username) => {
      const result = await authApi.completeUsername({ username });
      const saved = normalizeUsername(username);
      try {
        const current = await refreshUser();
        if (hasUsername(current)) return result;
      } catch {
        /* the username response already succeeded; keep the session */
      }
      setOnboardingComplete(true);
      setUsernameRequired(false);
      setStatus("authenticated");
      setUser((current) => ({
        id: current?.id ?? null,
        username: saved,
        fullName: current?.fullName ?? "",
        email: current?.email ?? "",
        role: current?.role ?? "USER",
        passwordConfigured: current?.passwordConfigured === true,
        googleLinked: current?.googleLinked === true,
      }));
      return result;
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
      needsUsername,
      signIn,
      signInWithGoogle,
      finishUsername,
      signOut,
      signOutAll,
      refreshUser,
    }),
    [user, status, needsUsername, signIn, signInWithGoogle, finishUsername, signOut, signOutAll, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
