import AuthSpinner from "../loaders/AuthSpinner";

export default function AuthPrimaryButton({ children, loading = false, disabled = false, ...props }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full h-10 rounded-lg bg-ink text-white font-display text-[13px] font-semibold tracking-[0.18em] uppercase transition-colors hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      {...props}
    >
      {loading ? <AuthSpinner /> : children}
    </button>
  );
}
