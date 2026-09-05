import { IconCheck, IconClose } from "../common/UserIcons";

export default function SuccessSnackbar({ message, tone = "success", onDismiss }) {
  if (!message) return null;

  const isError = tone === "danger";

  return (
    <div
      className={`fixed top-6 right-6 z-60 flex max-w-sm items-center gap-3 rounded-xl px-4 py-2.5 text-xs text-white shadow-2xl ${
        isError ? "bg-danger" : "bg-ink"
      }`}
      role={isError ? "alert" : "status"}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          isError ? "bg-white/15 text-white" : "bg-accent text-ink"
        }`}
      >
        {isError ? <IconClose className="h-3 w-3" /> : <IconCheck className="h-3 w-3" />}
      </span>
      <span className="font-medium">{message}</span>
      <button type="button" onClick={onDismiss} className="ml-1 text-white/70 hover:text-white" aria-label="Dismiss">
        <IconClose className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
