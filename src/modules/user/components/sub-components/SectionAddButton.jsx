import { IconPlus } from "../common/UserIcons";
import Spinner from "../../../../common/components/loaders/Spinner";

export default function SectionAddButton({
  label,
  onClick,
  disabled = false,
  busy = false,
  variant = "outline",
}) {
  const base =
    "inline-flex shrink-0 items-center justify-center rounded-xl text-xs font-semibold disabled:opacity-50 h-8 w-8 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-2";
  const skin =
    variant === "solid"
      ? "bg-ink text-white hover:opacity-90"
      : "border border-ink text-ink hover:bg-ink hover:text-white";

  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className={`${base} ${skin}`}>
      {busy ? <Spinner className="h-3.5 w-3.5 text-current" /> : <IconPlus className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
