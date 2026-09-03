import { useEffect, useRef, useState } from "react";

export default function AuthPasswordField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder = "••••••••",
  autoComplete = "current-password",
}) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);
  const errorId = `${id}-error`;

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return undefined;
    const hideForSubmit = () => setVisible(false);
    form.addEventListener("submit", hideForSubmit, true);
    return () => form.removeEventListener("submit", hideForSubmit, true);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name || id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 w-full rounded-lg bg-field px-3.5 pr-14 text-sm text-ink placeholder:text-muted/80 outline-none transition-all border ${
            error ? "border-danger" : "border-transparent focus:border-ink focus:bg-white"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-[0.12em] uppercase text-muted hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="text-[11px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
