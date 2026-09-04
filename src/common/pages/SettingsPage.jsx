import { useSettings } from "../hooks/useSettings";

export default function SettingsPage() {
  const { user, themeId, themes, setTheme, busy, error, handleLogout, handleLogoutAll } = useSettings();

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="font-display text-3xl tracking-[0.06em] uppercase">Settings</h1>
      <p className="mt-2 text-sm text-muted">
        Theme is stored on this device. Account appearance persistence will be added later.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mt-8 border border-line rounded-2xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em]">Appearance</h2>
        <p className="mt-2 text-sm text-muted">
          These colours replace the 30% ink surfaces. White remains the primary background and gold stays the accent.
        </p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3" role="list">
          {themes.map((theme) => {
            const selected = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setTheme(theme.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selected ? "border-accent ring-2 ring-accent/40" : "border-line hover:border-ink/40"
                }`}
                aria-pressed={selected}
              >
                <span className="block h-10 rounded-lg border border-black/10" style={{ background: theme.ink }} />
                <span className="mt-2 block text-sm font-semibold">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 border border-line rounded-2xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em]">Account</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-medium">{user?.fullName || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Username</dt>
            <dd className="font-medium">{user?.username || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{user?.email || "—"}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={Boolean(busy)}
            className="h-10 px-4 rounded-xl bg-ink text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy === "logout" ? "Signing out…" : "Log out this device"}
          </button>
          <button
            type="button"
            onClick={handleLogoutAll}
            disabled={Boolean(busy)}
            className="h-10 px-4 rounded-xl border border-line text-sm font-semibold disabled:opacity-60"
          >
            {busy === "logout-all" ? "Signing out…" : "Log out all devices"}
          </button>
        </div>
      </section>
    </div>
  );
}
