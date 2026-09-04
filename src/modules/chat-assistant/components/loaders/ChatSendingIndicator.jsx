export default function ChatSendingIndicator() {
  return (
    <div className="flex gap-3 px-1 py-2" role="status" aria-live="polite">
      <div className="h-8 w-8 shrink-0 rounded-full bg-ink text-white grid place-items-center mt-0.5" aria-hidden="true">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8V4H8M4 8h16v12H4zM2 14h2m16 0h2M15 13v2M9 13v2" />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold text-ink">Writing a reply</p>
        <p className="text-[11px] text-muted mt-0.5">This can take up to a minute. Only the latest 16 turns are sent to the model.</p>
        <span className="mt-2 inline-block h-3 w-1.5 bg-ink animate-pulse" />
      </div>
    </div>
  );
}
