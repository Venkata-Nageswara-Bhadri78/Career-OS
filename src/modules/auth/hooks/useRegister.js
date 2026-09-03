import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import { AUTH_COPY } from "../utils/authMessages";
import { offerToSaveCredentials } from "../utils/saveCredentials";
import { normalizeEmail, normalizeFullName, validateRegisterForm } from "../utils/authValidation";
import { AUTH_PATHS } from "../config/authConfig";
import { useCooldown } from "./useCooldown";

export function useRegister() {
  const navigate = useNavigate();
  const requestId = useRef(0);
  const [form, setForm] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
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

  const goToVerify = () => {
    navigate(AUTH_PATHS.VERIFY_EMAIL, {
      replace: true,
      state: { email: normalizeEmail(form.email), fromRegister: true },
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting || cooldown > 0) return;

    const nextErrors = validateRegisterForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const currentRequest = ++requestId.current;
    setIsSubmitting(true);
    setError("");

    try {
      await authApi.register(form);
      if (currentRequest !== requestId.current) return;
      await Promise.race([
        offerToSaveCredentials({
          email: normalizeEmail(form.email),
          password: form.password,
          fullName: normalizeFullName(form.fullName),
        }),
        new Promise((resolve) => window.setTimeout(resolve, 4000)),
      ]);
      if (currentRequest !== requestId.current) return;
      goToVerify();
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      if (err.status === 409) {
        goToVerify();
        return;
      }
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
    isSubmitting,
    cooldown,
    updateField,
    submit,
  };
}
