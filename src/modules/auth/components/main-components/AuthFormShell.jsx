import { Link } from "react-router-dom";
import { AUTH_CONFIG } from "../../config/authConfig";

export default function AuthFormShell({
  title = "CAREER-OS",
  subtitle = "Find jobs, optimize your resume, prepare for interviews, and track every application — all in one place.",
  headerAction,
  children,
}) {
  return (
    <section className="w-full lg:w-[38%] h-full min-w-0 overflow-hidden bg-bg flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-8 pt-4 sm:pt-5 shrink-0">
        <span className="h-6 w-6 sm:h-7 sm:w-7 bg-ink shrink-0" aria-hidden="true" />
        {headerAction ? (
          <Link
            to={headerAction.to}
            className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-ink hover:text-accent transition-colors whitespace-nowrap shrink-0"
          >
            {headerAction.label} →
          </Link>
        ) : (
          <span />
        )}
      </header>

      <div className="flex-1 min-h-0 flex flex-col justify-center px-4 sm:px-8 lg:px-10 py-3 sm:py-4">
        <div className="w-full max-w-[400px] mx-auto min-w-0">
          <h1 className="font-display text-[28px] sm:text-[36px] leading-none tracking-[0.04em] text-ink">{title}</h1>
          <p className="mt-2 text-xs sm:text-[13px] leading-5 text-muted text-pretty">{subtitle}</p>
          <div className="mt-4 sm:mt-5">{children}</div>
        </div>
      </div>

      <footer className="px-4 sm:px-8 pb-3 sm:pb-4 shrink-0">
        <div className="border-t border-line pt-2.5 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.14em] text-muted">
          <span className="truncate">CAREER_OS_ID: {AUTH_CONFIG.instanceId}</span>
          <a href={`mailto:${AUTH_CONFIG.supportEmail}`} className="uppercase underline underline-offset-2 hover:text-ink shrink-0">
            Support
          </a>
        </div>
      </footer>
      <div className="h-3 bg-ink lg:hidden shrink-0" />
    </section>
  );
}
