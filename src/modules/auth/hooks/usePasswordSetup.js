import { useRef, useState } from "react";
import { AUTH_MESSAGES } from "../../../common/api/apiError";
import authApi from "../api/authApi";
import { hasSession } from "../api/tokenStorage";
import { AUTH_CONFIG } from "../config/authConfig";
import { AUTH_COPY } from "../utils/authMessages";
import { validateSetupPasswordForm } from "../utils/authValidation";
import { useAuth } from "./useAuth";
import { useCooldown } from "./useCooldown";

const EMPTY_FORM = { otp: "", newPassword: "", confirmPassword: "" };

export function usePasswordSetup() {
  const { user, refreshUser } = useAuth();
  const requestId = useRef(0);
  const [phase, setPhase] = useState("idle");
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [markedConfigured, setMarkedConfigured] = useState(false);
  const [cooldown, setCooldown] = useCooldown(0);

  const passwordConfigured = markedConfigured || user?.passwordConfigured === true;
  const actionLabel = passwordConfigured ? "Change password" : "Set up password";

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError("");
  };

  const requestCode = async () => {
    if (busy || cooldown > 0) return;
    const currentRequest = ++requestId.current;
    setBusy("request");
    setError("");
    try {
      const result = await authApi.requestPasswordSetup();
      if (currentRequest !== requestId.current) return;
      const message = result.message || "";
      setNotice(message);
      setPhase("confirm");
      if (message !== AUTH_MESSAGES.PASSWORD_CODE_RECENT) {
        setForm((current) => ({ ...current, otp: "" }));
      }
      setCooldown(Math.ceil(AUTH_CONFIG.resendCooldownMs / 1000));
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setError(err?.message || AUTH_COPY.genericError);
      if (err?.retryAfter) setCooldown(err.retryAfter);
    } finally {
      if (currentRequest === requestId.current) setBusy("");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors = validateSetupPasswordForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const currentRequest = ++requestId.current;
    setBusy("confirm");
    setError("");

    try {
      const result = await authApi.confirmPasswordSetup({
        otp: form.otp,
        newPassword: form.newPassword,
      });
      if (!hasSession()) {
        throw Object.assign(new Error(result?.message || AUTH_COPY.unauthorized), { status: 401 });
      }
      try {
        await refreshUser();
      } catch (refreshError) {
        if (!hasSession()) throw refreshError;
      }
      if (currentRequest !== requestId.current) return;
      setForm(EMPTY_FORM);
      setFieldErrors({});
      setMarkedConfigured(true);
      setNotice(result?.message || "");
      setPhase("saved");
      setCooldown(0);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setFieldErrors(err?.fieldErrors || {});
      setError(err?.message || AUTH_COPY.genericError);
      if (err?.retryAfter) setCooldown(err.retryAfter);
    } finally {
      if (currentRequest === requestId.current) setBusy("");
    }
  };

  const cancel = () => {
    setPhase("idle");
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError("");
    setNotice("");
  };

  return {
    user,
    phase,
    form,
    fieldErrors,
    error,
    notice,
    busy,
    cooldown,
    passwordConfigured,
    actionLabel,
    updateField,
    requestCode,
    submit,
    cancel,
  };
}
