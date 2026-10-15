import { usePasswordSetup } from "../../hooks/usePasswordSetup";
import AuthAlert from "../sub-components/AuthAlert";
import AuthOtpInput from "../sub-components/AuthOtpInput";
import AuthPasswordField from "../sub-components/AuthPasswordField";

export default function PasswordSetupSection() {
  const {
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
  } = usePasswordSetup();

  const description = passwordConfigured
    ? "Replace your password for email sign-in. A 6-digit code is emailed to you and expires in 10 minutes. Other sessions are signed out after the password is saved."
    : "Add a password so this account can also sign in with email and password. A 6-digit code is emailed to you and expires in 10 minutes.";

  return (
    <section className="mt-6 border border-line rounded-2xl p-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.16em]">Password</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
      {user?.email ? <p className="mt-1 text-sm text-muted">{user.email}</p> : null}

      {error ? (
        <div className="mt-4">
          <AuthAlert>{error}</AuthAlert>
        </div>
      ) : null}
      {notice ? (
        <div className="mt-4">
          <AuthAlert tone="success">{notice}</AuthAlert>
        </div>
      ) : null}

      {phase === "confirm" ? (
        <form onSubmit={submit} className="mt-5 flex max-w-md flex-col gap-3" noValidate>
          <AuthOtpInput
            id="setup-otp"
            value={form.otp}
            onChange={(value) => updateField("otp", value)}
            error={fieldErrors.otp}
            disabled={Boolean(busy)}
          />
          <AuthPasswordField
            id="setup-new-password"
            name="newPassword"
            label="New_password"
            value={form.newPassword}
            onChange={(value) => updateField("newPassword", value)}
            error={fieldErrors.newPassword}
            autoComplete="new-password"
          />
          <AuthPasswordField
            id="setup-confirm-password"
            name="confirmPassword"
            label="Confirm_password"
            value={form.confirmPassword}
            onChange={(value) => updateField("confirmPassword", value)}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={Boolean(busy)}
              className="h-10 px-4 rounded-xl bg-ink text-white text-sm font-semibold disabled:opacity-60"
            >
              {busy === "confirm" ? "Saving…" : "Save password"}
            </button>
            <button
              type="button"
              onClick={requestCode}
              disabled={Boolean(busy) || cooldown > 0}
              className="h-10 px-4 rounded-xl border border-line text-sm font-semibold disabled:opacity-60"
            >
              {busy === "request" ? "Sending…" : cooldown > 0 ? `Send again in ${cooldown}s` : "Send code again"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={Boolean(busy)}
              className="h-10 px-4 rounded-xl text-sm font-semibold text-muted disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={requestCode}
          disabled={Boolean(busy) || cooldown > 0}
          className="mt-5 h-10 px-4 rounded-xl bg-ink text-white text-sm font-semibold disabled:opacity-60"
        >
          {busy === "request" ? "Sending…" : cooldown > 0 ? `Wait ${cooldown}s` : actionLabel}
        </button>
      )}
    </section>
  );
}
