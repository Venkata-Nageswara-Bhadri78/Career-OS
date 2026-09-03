import { AUTH_PATHS } from "../../config/authConfig";
import { AUTH_COPY } from "../../utils/authMessages";
import { useVerifyEmail } from "../../hooks/useVerifyEmail";
import AuthAlert from "../sub-components/AuthAlert";
import AuthOtpInput from "../sub-components/AuthOtpInput";
import AuthPrimaryButton from "../sub-components/AuthPrimaryButton";
import AuthTextField from "../sub-components/AuthTextField";
import AuthFormShell from "./AuthFormShell";

export default function VerifyEmailForm() {
  const {
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
  } = useVerifyEmail();

  return (
    <AuthFormShell
      subtitle="Enter the 6-digit code from your inbox to activate the account."
      headerAction={{ to: AUTH_PATHS.LOGIN, label: "Sign in" }}
    >
      <form onSubmit={submit} className="flex flex-col gap-2.5" noValidate>
        <AuthAlert>{error}</AuthAlert>
        <AuthAlert tone="success">{notice}</AuthAlert>
        <p className="text-xs text-muted">{AUTH_COPY.registerInboxHint}</p>
        <AuthTextField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          error={fieldErrors.email}
          placeholder="you@domain.com"
          autoComplete="username"
          readOnly={emailLocked}
        />
        <AuthOtpInput
          id="otp"
          value={form.otp}
          onChange={(value) => updateField("otp", value)}
          error={fieldErrors.otp}
          disabled={isSubmitting}
        />
        <AuthPrimaryButton loading={isSubmitting} disabled={isResending}>
          Verify email
        </AuthPrimaryButton>
        <button
          type="button"
          onClick={resend}
          disabled={isResending || isSubmitting || cooldown > 0}
          className="text-xs font-semibold text-ink underline underline-offset-2 disabled:text-muted disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend available in ${cooldown}s` : isResending ? "Sending…" : "Resend OTP"}
        </button>
      </form>
    </AuthFormShell>
  );
}
