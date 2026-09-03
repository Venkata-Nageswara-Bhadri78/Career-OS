import { useRef, useState } from "react";
import authApi from "../api/authApi";
import { AUTH_COPY } from "../utils/authMessages";
import { validateForgotPasswordForm } from "../utils/authValidation";
import { AUTH_CONFIG } from "../config/authConfig";
import { useCooldown } from "./useCooldown";

export function useForgotPassword() {
  const requestId = useRef(0);
  const [form, setForm] = useState({ email: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
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

    const nextErrors = validateForgotPasswordForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const currentRequest = ++requestId.current;
    setIsSubmitting(true);
    setError("");
    setNotice("");

    try {
      await authApi.forgotPassword(form);
      if (currentRequest !== requestId.current) return;
      setNotice(AUTH_COPY.forgotGeneric);
      setCooldown(Math.ceil(AUTH_CONFIG.resendCooldownMs / 1000));
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setFieldErrors(err.fieldErrors || {});
      setError(err.message || AUTH_COPY.genericError);
      if (err.retryAfter) setCooldown(err.retryAfter);
    } finally {
      if (currentRequest === requestId.current) setIsSubmitting(false);
    }
  };

  return {
    form,
    fieldErrors,
    error,
    notice,
    isSubmitting,
    cooldown,
    updateField,
    submit,
  };
}
