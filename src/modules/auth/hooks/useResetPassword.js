import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authApi from "../api/authApi";
import { AUTH_PATHS } from "../config/authConfig";
import { AUTH_COPY } from "../utils/authMessages";
import { normalizeResetToken, validateResetPasswordForm } from "../utils/authValidation";

export function useResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = useRef(0);
  const queryToken = normalizeResetToken(searchParams.get("token") || "");

  const [form, setForm] = useState({
    token: queryToken,
    newPassword: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateResetPasswordForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const currentRequest = ++requestId.current;
    setIsSubmitting(true);
    setError("");
    setNotice("");

    try {
      await authApi.resetPassword({
        token: form.token,
        newPassword: form.newPassword,
      });
      if (currentRequest !== requestId.current) return;
      setNotice(AUTH_COPY.resetSuccess);
      window.setTimeout(() => navigate(AUTH_PATHS.LOGIN, { replace: true }), 1600);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setFieldErrors(err.fieldErrors || {});
      setError(err.message || AUTH_COPY.genericError);
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
    updateField,
    submit,
  };
}
