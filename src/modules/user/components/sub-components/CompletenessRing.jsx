export default function CompletenessRing({ percentage, children, size = "lg" }) {
  const value = Math.max(0, Math.min(100, Number(percentage) || 0));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const box = size === "md" ? "h-[5.75rem] w-[5.75rem] sm:h-[6.5rem] sm:w-[6.5rem]" : "h-[7.25rem] w-[7.25rem] sm:h-32 sm:w-32";

  return (
    <div className={`relative shrink-0 ${box}`}>
      <svg className="user-completeness-ring absolute inset-0 h-full w-full" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--theme-line)" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--theme-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-[8px] overflow-hidden rounded-full bg-field">
        {children}
      </div>
      <span className="sr-only">Profile {value}% complete</span>
    </div>
  );
}
