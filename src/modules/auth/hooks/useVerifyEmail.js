import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import { AUTH_CONFIG, AUTH_PATHS } from "../config/authConfig";
import { AUTH_COPY } from "../utils/authMessages";
import { normalizeEmail, validateEmail, validateVerifyEmailForm } from "../utils/authValidation";
import { useCooldown } from "./useCooldown";

export function useVerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = useRef(0);
  const emailFromState = normalizeEmail(location.state?.email || "");
  const fromRegister = Boolean(location.state?.fromRegister);

  const [form, setForm] = useState({
    email: emailFromState,
    otp: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(fromRegister ? AUTH_COPY.registerSuccess : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useCooldown(fromRegister ? Math.ceil(AUTH_CONFIG.resendCooldownMs / 1000) : 0);

  const emailLocked = useMemo(() => Boolean(emailFromState), [emailFromState]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting || isResending) return;

    const nextErrors = validateVerifyEmailForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const currentRequest = ++requestId.current;
    setIsSubmitting(true);
    setError("");

    try {
      await authApi.verifyEmail(form);
      if (currentRequest !== requestId.current) return;
      setNotice(AUTH_COPY.verifySuccess);
      window.setTimeout(() => {
        navigate(AUTH_PATHS.LOGIN, {
          replace: true,
          state: { email: normalizeEmail(form.email) },
        });
      }, 1200);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setFieldErrors(err.fieldErrors || {});
      setError(err.message || AUTH_COPY.genericError);
      if (err.retryAfter) setCooldown(err.retryAfter);
    } finally {
      if (currentRequest === requestId.current) setIsSubmitting(false);
    }
  };

  const resend = async () => {
    if (isResending || isSubmitting || cooldown > 0) return;
    const emailError = validateEmail(form.email);
    if (emailError) {
      setFieldErrors((current) => ({ ...current, email: emailError }));
      return;
    }

    setIsResending(true);
    setError("");
    try {
      await authApi.resendOtp({ email: form.email });
      setNotice(AUTH_COPY.resendGeneric);
      setCooldown(Math.ceil(AUTH_CONFIG.resendCooldownMs / 1000));
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      setError(err.message || AUTH_COPY.genericError);
      if (err.retryAfter) setCooldown(err.retryAfter);
    } finally {
      setIsResending(false);
    }
  };

  return {
    form,
    fieldErrors,
    error,
    notice,
    isSubmitting,
    isResending,
    cooldown,
    emailLocked,
    updateField,
    submit,
    resend,
  };
}
