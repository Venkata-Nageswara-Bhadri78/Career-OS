const toastPositionClass =
  "max-md:fixed max-md:top-[4.6rem] max-md:right-2 max-md:left-auto max-md:w-[80%] max-md:max-w-[80%] max-md:z-[60] md:relative md:inset-auto md:w-auto md:max-w-none md:z-10";

export default function SuccessSnackbar({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      className={`${toastPositionClass} flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-black text-white text-xs shadow-2xl animate-in fade-in duration-200 max-md:justify-between`}
    >
      <span className="h-5 w-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
        <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="min-w-0 flex-1 font-medium truncate">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 px-0.5 text-zinc-400 hover:text-white transition-colors text-sm leading-none"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export { toastPositionClass };
