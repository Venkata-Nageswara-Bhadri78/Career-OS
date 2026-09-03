import { Link } from "react-router-dom";
import { AUTH_PATHS } from "../../config/authConfig";
import { AUTH_COPY } from "../../utils/authMessages";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import AuthAlert from "../sub-components/AuthAlert";
import AuthPrimaryButton from "../sub-components/AuthPrimaryButton";
import AuthTextField from "../sub-components/AuthTextField";
import AuthFormShell from "./AuthFormShell";

export default function ForgotPasswordForm() {
  const { form, fieldErrors, error, notice, isSubmitting, cooldown, updateField, submit } = useForgotPassword();

  return (
    <AuthFormShell
      subtitle="Enter your email. If an account exists, we will send a reset token to paste on the next screen."
      headerAction={{ to: AUTH_PATHS.LOGIN, label: "Sign in" }}
    >
      <form onSubmit={submit} className="flex flex-col gap-2.5" noValidate>
        <AuthAlert>{error}</AuthAlert>
        <AuthAlert tone="success">{notice}</AuthAlert>
        <AuthTextField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          error={fieldErrors.email}
          placeholder="you@domain.com"
          autoComplete="username"
        />
        <p className="text-xs text-muted">{AUTH_COPY.forgotHint}</p>
        <AuthPrimaryButton loading={isSubmitting} disabled={cooldown > 0}>
          {cooldown > 0 ? `Retry in ${cooldown}s` : "Send reset token"}
        </AuthPrimaryButton>
        <p className="text-xs text-muted">
          Already have a token?{" "}
          <Link to={AUTH_PATHS.RESET_PASSWORD} className="font-semibold text-ink underline underline-offset-2">
            Paste it here
          </Link>
        </p>
      </form>
    </AuthFormShell>
  );
}
