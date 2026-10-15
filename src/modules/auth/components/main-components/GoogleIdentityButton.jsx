import { useEffect, useRef, useState } from "react";
import { AUTH_MESSAGES } from "../../../../common/api/apiError";
import { GOOGLE_WEB_CLIENT_ID } from "../../config/authConfig";
import { useCooldown } from "../../hooks/useCooldown";
import { loadGoogleIdentityServices } from "../../utils/googleIdentity";
import { AUTH_COPY } from "../../utils/authMessages";

export default function GoogleIdentityButton({
  onCredential,
  onError,
  pendingLabel = "Signing in…",
  unavailableText = "Continue with Google is unavailable until the web client ID is configured.",
}) {
  const containerRef = useRef(null);
  const credentialRef = useRef(onCredential);
  const errorRef = useRef(onError);
  const cooldownRef = useRef(0);
  const inFlight = useRef(false);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useCooldown(0);

  useEffect(() => {
    credentialRef.current = onCredential;
    errorRef.current = onError;
    cooldownRef.current = cooldown;
  }, [onCredential, onError, cooldown]);

  useEffect(() => {
    const container = containerRef.current;
    if (!GOOGLE_WEB_CLIENT_ID || !container) return undefined;
    let cancelled = false;

    const handleCredential = async (credential) => {
      const idToken = String(credential ?? "").trim();
      if (!idToken) {
        errorRef.current?.({ message: AUTH_MESSAGES.INVALID_GOOGLE_TOKEN });
        return;
      }
      if (inFlight.current || cooldownRef.current > 0) return;
      inFlight.current = true;
      setIsSubmitting(true);
      errorRef.current?.({ message: "" });
      try {
        await credentialRef.current?.(idToken);
      } catch (err) {
        errorRef.current?.({
          message: err?.message || AUTH_COPY.genericError,
          status: err?.status,
          retryAfter: err?.retryAfter,
        });
        if (err?.retryAfter) setCooldown(err.retryAfter);
      } finally {
        inFlight.current = false;
        setIsSubmitting(false);
      }
    };

    loadGoogleIdentityServices()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          callback: (response) => {
            void handleCredential(response?.credential);
          },
        });
        const host = containerRef.current;
        host.replaceChildren();
        const width = Math.max(240, Math.floor(host.getBoundingClientRect().width) || 320);
        google.accounts.id.renderButton(host, {
          text: "continue_with",
          size: "large",
          width,
          theme: "outline",
          shape: "rectangular",
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err?.message || "Unable to load Google sign-in.");
      });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [setCooldown]);

  if (!GOOGLE_WEB_CLIENT_ID) {
    return <p className="text-center text-xs leading-5 text-muted">{unavailableText}</p>;
  }

  return (
    <div className={isSubmitting || cooldown > 0 ? "pointer-events-none opacity-60" : ""}>
      {loadError ? <p className="mb-2 text-center text-xs leading-5 text-danger">{loadError}</p> : null}
      <div ref={containerRef} data-google-signin className="flex min-h-10 w-full justify-center" />
      {isSubmitting ? (
        <p className="mt-2 text-center text-xs text-muted" role="status">
          {pendingLabel}
        </p>
      ) : null}
      {cooldown > 0 ? (
        <p className="mt-2 text-center text-xs text-muted" role="status">
          Retry in {cooldown}s
        </p>
      ) : null}
    </div>
  );
}
