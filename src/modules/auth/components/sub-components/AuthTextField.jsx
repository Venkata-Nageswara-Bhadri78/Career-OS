export default function AuthTextField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  readOnly = false,
  maxLength,
  inputMode,
  describedBy,
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={[error ? errorId : null, describedBy].filter(Boolean).join(" ") || undefined}
        className={`h-10 rounded-lg bg-field px-3.5 text-sm text-ink placeholder:text-muted/80 outline-none transition-all border ${
          error ? "border-danger" : "border-transparent focus:border-ink focus:bg-white"
        } ${readOnly ? "text-muted cursor-not-allowed" : ""}`}
      />
      {error ? (
        <p id={errorId} className="text-[11px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
