import { Link } from "react-router-dom";
import { AUTH_PATHS } from "../../config/authConfig";
import { useLogin } from "../../hooks/useLogin";
import AuthAlert from "../sub-components/AuthAlert";
import AuthPasswordField from "../sub-components/AuthPasswordField";
import AuthPrimaryButton from "../sub-components/AuthPrimaryButton";
import AuthTextField from "../sub-components/AuthTextField";
import AuthFormShell from "./AuthFormShell";

export default function LoginForm() {
  const { form, fieldErrors, error, isSubmitting, cooldown, updateField, submit } = useLogin();

  return (
    <AuthFormShell
      subtitle="Sign in to continue tracking jobs, resumes, and interviews in one place."
      headerAction={{ to: AUTH_PATHS.REGISTER, label: "Register" }}
    >
      <form
        method="post"
        action={AUTH_PATHS.LOGIN}
        autoComplete="on"
        onSubmit={submit}
        className="flex flex-col gap-2.5"
        noValidate
      >
        <AuthAlert>{error}</AuthAlert>
        <AuthTextField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          error={fieldErrors.email}
          placeholder="you@domain.com"
          autoComplete="username"
        />
        <AuthPasswordField
          id="password"
          name="password"
          label="Password"
          value={form.password}
          onChange={(value) => updateField("password", value)}
          error={fieldErrors.password}
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(event) => updateField("rememberMe", event.target.checked)}
              className="h-3.5 w-3.5 accent-ink"
            />
            Remember this browser
          </label>
          <Link to={AUTH_PATHS.FORGOT_PASSWORD} className="text-xs font-semibold text-ink underline underline-offset-2">
            Forgot password?
          </Link>
        </div>
        <AuthPrimaryButton loading={isSubmitting} disabled={cooldown > 0}>
          {cooldown > 0 ? `Retry in ${cooldown}s` : "Sign in"}
        </AuthPrimaryButton>
      </form>
    </AuthFormShell>
  );
}
