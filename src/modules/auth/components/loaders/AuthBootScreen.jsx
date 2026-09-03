export default function AuthBootScreen() {
  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <div className="h-10 w-10 bg-ink" />
        <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-muted">Loading session</p>
      </div>
    </div>
  );
}
