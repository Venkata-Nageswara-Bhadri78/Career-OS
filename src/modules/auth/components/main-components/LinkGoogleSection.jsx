import { useCallback, useState } from "react";
import { AUTH_MESSAGES } from "../../../../common/api/apiError";
import authApi from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import AuthAlert from "../sub-components/AuthAlert";
import GoogleIdentityButton from "./GoogleIdentityButton";

export default function LinkGoogleSection() {
  const { user, refreshUser } = useAuth();
  const [markedLinked, setMarkedLinked] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const googleLinked = markedLinked || user?.googleLinked === true;

  const onCredential = useCallback(
    async (idToken) => {
      setError("");
      setNotice("");
      try {
        const result = await authApi.linkGoogle({ idToken });
        setMarkedLinked(true);
        try {
          const current = await refreshUser();
          if (current && current.googleLinked === false) setMarkedLinked(false);
        } catch {
          /* the link response does not replace the session */
        }
        setNotice(result.message || AUTH_MESSAGES.GOOGLE_LINKED);
      } catch (err) {
        if (err?.status === 409 && err?.message === AUTH_MESSAGES.GOOGLE_ALREADY_ON_USER) {
          try {
            const current = await refreshUser();
            if (current?.googleLinked) {
              setMarkedLinked(true);
              setError("");
              return;
            }
          } catch {
            /* show the server message below */
          }
        }
        throw err;
      }
    },
    [refreshUser]
  );

  return (
    <section className="mt-6 border border-line rounded-2xl p-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.16em]">Link Google</h2>
      {googleLinked ? (
        <p className="mt-2 text-sm text-muted">Google is linked to this account.</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            Choose the Google account for {user?.email || "this account"}. After it is linked, Continue with Google
            opens this same account.
          </p>
          {error ? (
            <div className="mt-4">
              <AuthAlert>{error}</AuthAlert>
            </div>
          ) : null}
          {notice ? (
            <div className="mt-4">
              <AuthAlert tone="success">{notice}</AuthAlert>
            </div>
          ) : null}
          <div className="mt-4 max-w-md">
            <GoogleIdentityButton
              onCredential={onCredential}
              onError={(err) => setError(err?.message || "")}
              pendingLabel="Linking…"
              unavailableText="Link Google is unavailable until the web client ID is configured."
            />
          </div>
        </>
      )}
      {googleLinked && notice ? (
        <div className="mt-4">
          <AuthAlert tone="success">{notice}</AuthAlert>
        </div>
      ) : null}
    </section>
  );
}
