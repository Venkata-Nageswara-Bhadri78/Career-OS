import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_PATHS, isSafeInternalPath } from "../config/authConfig";
import { AUTH_COPY } from "../utils/authMessages";
import { normalizeEmail, validateLoginForm } from "../utils/authValidation";
import { isSessionPersisted } from "../api/tokenStorage";
import { useAuth } from "./useAuth";
import { useCooldown } from "./useCooldown";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const requestId = useRef(0);
  const [form, setForm] = useState({
    email: normalizeEmail(location.state?.email || ""),
    password: "",
    rememberMe: isSessionPersisted(),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useCooldown(0);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting || cooldown > 0) return;

    const nextErrors = validateLoginForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const currentRequest = ++requestId.current;
    setIsSubmitting(true);
    setError("");

    try {
      await signIn({
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      });
      if (currentRequest !== requestId.current) return;
      const nextPath = location.state?.from;
      const destination =
        isSafeInternalPath(nextPath) && nextPath !== AUTH_PATHS.LOGIN && nextPath !== AUTH_PATHS.REGISTER
          ? nextPath
          : AUTH_PATHS.DASHBOARD;
      navigate(destination, { replace: true });
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setFieldErrors(err.fieldErrors || {});
      setError(err.message || AUTH_COPY.loginGenericFailure);
      if (err.retryAfter) setCooldown(err.retryAfter);
    } finally {
      if (currentRequest === requestId.current) setIsSubmitting(false);
    }
  };

  return {
    form,
    fieldErrors,
    error,
    isSubmitting,
    cooldown,
    updateField,
    submit,
  };
}
