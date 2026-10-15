import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_MESSAGES } from "../../../common/api/apiError";
import { AUTH_PATHS } from "../config/authConfig";
import { hasUsername } from "../utils/onboarding";
import { AUTH_COPY } from "../utils/authMessages";
import { validateUsername } from "../utils/authValidation";
import { useAuth } from "./useAuth";
import { useCooldown } from "./useCooldown";

export function usePreComplete() {
  const navigate = useNavigate();
  const { user, finishUsername, refreshUser, signOut, signOutAll } = useAuth();
  const requestId = useRef(0);
  const [username, setUsername] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [cooldown, setCooldown] = useCooldown(0);

  const updateUsername = (value) => {
    setUsername(value);
    setFieldError("");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting || isLeaving || cooldown > 0) return;

    const nextError = validateUsername(username);
    if (nextError) {
      setFieldError(nextError);
      return;
    }

    const currentRequest = ++requestId.current;
    setIsSubmitting(true);
    setError("");

    try {
      await finishUsername(username);
      if (currentRequest !== requestId.current) return;
      navigate(AUTH_PATHS.DASHBOARD, { replace: true });
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      if (err?.status === 409 && err?.message === AUTH_MESSAGES.USERNAME_ALREADY_SET) {
        try {
          const current = await refreshUser();
          if (hasUsername(current)) {
            navigate(AUTH_PATHS.DASHBOARD, { replace: true });
            return;
          }
        } catch {
          /* stay on the username page and show the server message */
        }
      }
      setFieldError(err?.fieldErrors?.username ? err.message : "");
      setError(err?.message || AUTH_COPY.genericError);
      if (err?.retryAfter) setCooldown(err.retryAfter);
    } finally {
      if (currentRequest === requestId.current) setIsSubmitting(false);
    }
  };

  const leave = async (everywhere) => {
    if (isLeaving) return;
    setIsLeaving(true);
    setError("");
    try {
      if (everywhere) await signOutAll();
      else await signOut();
    } catch {
      setError("Unable to sign out right now. Your local session was cleared.");
    } finally {
      setIsLeaving(false);
      navigate(AUTH_PATHS.LOGIN, { replace: true });
    }
  };

  return {
    user,
    username,
    fieldError,
    error,
    isSubmitting,
    isLeaving,
    cooldown,
    updateUsername,
    submit,
    logOut: () => leave(false),
    logOutAll: () => leave(true),
  };
}
