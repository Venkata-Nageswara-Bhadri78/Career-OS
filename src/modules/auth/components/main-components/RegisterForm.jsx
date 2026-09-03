import { AUTH_PATHS } from "../../config/authConfig";
import { useRegister } from "../../hooks/useRegister";
import AuthAlert from "../sub-components/AuthAlert";
import AuthLegalNote from "../sub-components/AuthLegalNote";
import AuthPasswordField from "../sub-components/AuthPasswordField";
import AuthPrimaryButton from "../sub-components/AuthPrimaryButton";
import AuthTextField from "../sub-components/AuthTextField";
import AuthFormShell from "./AuthFormShell";

export default function RegisterForm() {
  const { form, fieldErrors, error, isSubmitting, cooldown, updateField, submit } = useRegister();

  return (
    <AuthFormShell headerAction={{ to: AUTH_PATHS.LOGIN, label: "Sign in" }}>
      <form
        method="post"
        action={AUTH_PATHS.REGISTER}
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
        <AuthTextField
          id="username"
          name="nickname"
          label="User_name"
          value={form.username}
          onChange={(value) => updateField("username", value)}
          error={fieldErrors.username}
          placeholder="e.g. Product Designer"
          autoComplete="nickname"
        />
        <AuthTextField
          id="fullName"
          name="name"
          label="Full_name"
          value={form.fullName}
          onChange={(value) => updateField("fullName", value)}
          error={fieldErrors.fullName}
          placeholder="e.g. Jane Doe"
          autoComplete="name"
        />
        <AuthPasswordField
          id="password"
          name="password"
          label="Password"
          value={form.password}
          onChange={(value) => updateField("password", value)}
          error={fieldErrors.password}
          autoComplete="new-password"
        />
        <AuthLegalNote />
        <AuthPrimaryButton loading={isSubmitting} disabled={cooldown > 0}>
          {cooldown > 0 ? `Retry in ${cooldown}s` : "Register"}
        </AuthPrimaryButton>
      </form>
    </AuthFormShell>
  );
}
