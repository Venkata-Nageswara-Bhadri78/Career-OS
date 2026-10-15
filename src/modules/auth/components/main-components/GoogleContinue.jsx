import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOnboardingComplete } from "../../api/tokenStorage";
import { AUTH_PATHS } from "../../config/authConfig";
import { useAuth } from "../../hooks/useAuth";
import { hasUsername } from "../../utils/onboarding";
import AuthAlert from "../sub-components/AuthAlert";
import GoogleIdentityButton from "./GoogleIdentityButton";

export default function GoogleContinue({ rememberMe }) {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState("");

  const onCredential = useCallback(
    async (idToken) => {
      const user = await signInWithGoogle({
        idToken,
        ...(typeof rememberMe === "boolean" ? { rememberMe } : {}),
      });
      const incomplete = user ? !hasUsername(user) : getOnboardingComplete() === false;
      navigate(incomplete ? AUTH_PATHS.PRE_COMPLETE : AUTH_PATHS.DASHBOARD, { replace: true });
    },
    [navigate, rememberMe, signInWithGoogle]
  );

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.16em] uppercase text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <AuthAlert>{error}</AuthAlert>
      <GoogleIdentityButton
        onCredential={onCredential}
        onError={(err) => setError(err?.message || "")}
        pendingLabel="Signing in…"
      />
    </div>
  );
}
