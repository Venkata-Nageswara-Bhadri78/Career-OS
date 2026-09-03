import { useMemo, useRef } from "react";
import { AUTH_CONFIG } from "../../config/authConfig";
import { normalizeOtp } from "../../utils/authValidation";

export default function AuthOtpInput({ id, value, onChange, error, disabled = false }) {
  const length = AUTH_CONFIG.otpLength;
  const digits = useMemo(() => {
    const next = normalizeOtp(value).split("");
    while (next.length < length) next.push("");
    return next;
  }, [value, length]);
  const refs = useRef([]);
  const errorId = `${id}-error`;

  const focusAt = (index) => {
    refs.current[index]?.focus();
    refs.current[index]?.select();
  };

  const updateAt = (index, raw) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      const next = digits.map((digit, i) => (i === index ? "" : digit)).join("");
      onChange(next);
      return;
    }
    if (cleaned.length > 1) {
      onChange(normalizeOtp(cleaned));
      focusAt(Math.min(cleaned.length, length) - 1);
      return;
    }
    const next = digits.map((digit, i) => (i === index ? cleaned : digit)).join("");
    onChange(normalizeOtp(next));
    if (index < length - 1) focusAt(index + 1);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${id}-0`} className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-ink">
        One-time code
      </label>
      <div className="flex gap-2" role="group" aria-label="Six-digit verification code">
        {digits.map((digit, index) => (
          <input
            key={`${id}-${index}`}
            id={index === 0 ? `${id}-0` : undefined}
            ref={(node) => {
              refs.current[index] = node;
            }}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={index === 0 ? length : 1}
            value={digit}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => updateAt(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digits[index] && index > 0) {
                focusAt(index - 1);
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              onChange(normalizeOtp(event.clipboardData.getData("text")));
            }}
            className={`h-10 w-full rounded-lg bg-field text-center font-mono text-base text-ink outline-none border transition-all ${
              error ? "border-danger" : "border-transparent focus:border-ink focus:bg-white"
            }`}
          />
        ))}
      </div>
      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
