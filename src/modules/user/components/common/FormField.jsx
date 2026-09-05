export default function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  grow = false,
  children,
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1${grow ? " min-h-0 flex-1" : ""}`}>
      <label htmlFor={id} className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {typeof children === "function" ? children({ id, describedBy, invalid: Boolean(error) }) : children}
      {hint ? (
        <p id={`${id}-hint`} className="text-[11px] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-[11px] leading-snug text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const fieldClassName =
  "h-10 w-full rounded-lg border border-line bg-field px-3.5 text-sm text-ink placeholder:text-muted/80 outline-none transition-colors disabled:opacity-60";

export const textareaClassName =
  "min-h-[4.75rem] w-full rounded-lg border border-line bg-field px-3.5 py-2 text-sm leading-relaxed text-ink placeholder:text-muted/80 outline-none transition-colors disabled:opacity-60 resize-y";

export const textareaFillClassName =
  "min-h-0 w-full flex-1 rounded-lg border border-line bg-field px-3.5 py-2 text-sm leading-relaxed text-ink placeholder:text-muted/80 outline-none transition-colors disabled:opacity-60 resize-none";

export function YearInput({
  id,
  value,
  onChange,
  required = false,
  placeholder,
  describedBy,
  invalid = false,
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      maxLength={4}
      required={required}
      placeholder={placeholder}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className={fieldClassName}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
    />
  );
}
