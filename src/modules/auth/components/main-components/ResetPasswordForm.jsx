import { AUTH_PATHS } from "../../config/authConfig";
import { AUTH_COPY } from "../../utils/authMessages";
import { useResetPassword } from "../../hooks/useResetPassword";
import AuthAlert from "../sub-components/AuthAlert";
import AuthPasswordField from "../sub-components/AuthPasswordField";
import AuthPrimaryButton from "../sub-components/AuthPrimaryButton";
import AuthTextField from "../sub-components/AuthTextField";
import AuthFormShell from "./AuthFormShell";

export default function ResetPasswordForm() {
  const { form, fieldErrors, error, notice, isSubmitting, updateField, submit } = useResetPassword();

  return (
    <AuthFormShell
      subtitle="Paste the token from your email and choose a new password."
      headerAction={{ to: AUTH_PATHS.LOGIN, label: "Sign in" }}
    >
      <form onSubmit={submit} className="flex flex-col gap-2.5" noValidate>
        <AuthAlert>{error}</AuthAlert>
        <AuthAlert tone="success">{notice}</AuthAlert>
        <AuthTextField
          id="token"
          label="Reset_token"
          value={form.token}
          onChange={(value) => updateField("token", value)}
          error={fieldErrors.token}
          placeholder="Paste the UUID from email"
          autoComplete="off"
        />
        <AuthPasswordField
          id="newPassword"
          label="New_password"
          value={form.newPassword}
          onChange={(value) => updateField("newPassword", value)}
          error={fieldErrors.newPassword}
          autoComplete="new-password"
        />
        <AuthPasswordField
          id="confirmPassword"
          label="Confirm_password"
          value={form.confirmPassword}
          onChange={(value) => updateField("confirmPassword", value)}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted">{AUTH_COPY.resetUnverifiedHint}</p>
        <AuthPrimaryButton loading={isSubmitting} disabled={Boolean(notice)}>
          Reset password
        </AuthPrimaryButton>
      </form>
    </AuthFormShell>
  );
}
