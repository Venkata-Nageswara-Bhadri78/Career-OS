export default function SuccessSnackbar({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black text-white text-xs shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
      <span className="h-5 w-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
        <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="font-medium">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 text-zinc-400 hover:text-white transition-colors text-sm leading-none"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
