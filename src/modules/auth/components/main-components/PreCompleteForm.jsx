import { AUTH_CONFIG } from "../../config/authConfig";
import { usePreComplete } from "../../hooks/usePreComplete";
import AuthAlert from "../sub-components/AuthAlert";
import AuthPrimaryButton from "../sub-components/AuthPrimaryButton";
import AuthTextField from "../sub-components/AuthTextField";
import AuthFormShell from "./AuthFormShell";

export default function PreCompleteForm() {
  const {
    user,
    username,
    fieldError,
    error,
    isSubmitting,
    isLeaving,
    cooldown,
    updateUsername,
    submit,
    logOut,
    logOutAll,
  } = usePreComplete();

  return (
    <AuthFormShell
      subtitle="Choose a username to finish your account. Email and name already came from Google."
      headerSlot={
        <button
          type="button"
          onClick={logOut}
          disabled={isLeaving || isSubmitting}
          className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-ink hover:text-accent transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
        >
          {isLeaving ? "Signing out…" : "Log out"}
        </button>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-2.5" noValidate>
        <AuthAlert>{error}</AuthAlert>
        {user?.fullName ? <p className="text-xs text-muted">Display name: {user.fullName}</p> : null}
        {user?.email ? <p className="text-xs text-muted">{user.email}</p> : null}
        <AuthTextField
          id="username"
          name="username"
          label="Username"
          value={username}
          onChange={updateUsername}
          error={fieldError}
          placeholder="Choose a username"
          autoComplete="username"
          maxLength={AUTH_CONFIG.usernameMax}
        />
        <p className="text-xs text-muted">Usernames are saved in lowercase.</p>
        <AuthPrimaryButton loading={isSubmitting} disabled={isLeaving || cooldown > 0}>
          {cooldown > 0 ? `Retry in ${cooldown}s` : "Save username"}
        </AuthPrimaryButton>
        <button
          type="button"
          onClick={logOutAll}
          disabled={isLeaving || isSubmitting}
          className="text-xs font-semibold text-muted underline underline-offset-2 disabled:opacity-60"
        >
          Log out all devices
        </button>
      </form>
    </AuthFormShell>
  );
}
