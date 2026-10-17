export default function CommunityStatusPanel({ title, message, busy = false, alert = false, children }) {
  return (
    <div className="flex w-full flex-1 items-start p-4 sm:p-6">
      <section
        className="w-full max-w-xl rounded-xl border border-line bg-field px-4 py-5 text-ink"
        role={alert ? "alert" : "status"}
        aria-live="polite"
        aria-busy={busy || undefined}
      >
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        {message ? <p className="mt-2 text-sm leading-6 text-muted break-words">{message}</p> : null}
        {children}
      </section>
    </div>
  );
}
