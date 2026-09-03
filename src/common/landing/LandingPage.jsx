import { Link, Navigate } from "react-router-dom";
import { AUTH_PATHS } from "../../modules/auth/config/authConfig";
import AuthBootScreen from "../../modules/auth/components/loaders/AuthBootScreen";
import { useAuth } from "../../modules/auth/hooks/useAuth";

const FEATURES = [
  {
    code: "01",
    title: "Job tracking",
    copy: "Capture every role, company, and status in one operating view instead of scattered tabs.",
  },
  {
    code: "02",
    title: "Resume systems",
    copy: "Keep versions, highlights, and application-ready context attached to the jobs you pursue.",
  },
  {
    code: "03",
    title: "Interview prep",
    copy: "Use AI-assisted practice that stays grounded in the job you are actually targeting.",
  },
  {
    code: "04",
    title: "Application telemetry",
    copy: "See what moved, what stalled, and what needs a follow-up without leaving the workspace.",
  },
];

export default function LandingPage() {
  const { isAuthenticated, isBooting } = useAuth();

  if (isBooting) return <AuthBootScreen />;
  if (isAuthenticated) return <Navigate to={AUTH_PATHS.DASHBOARD} replace />;

  return (
    <div className="min-h-screen bg-ink text-white font-sans">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <div className="flex items-center gap-3">
          <span className="relative h-8 w-8 border border-white">
            <span className="absolute inset-[7px] bg-white" />
          </span>
          <span className="font-display text-xl tracking-[0.14em]">CAREER-OS</span>
        </div>
        <nav className="flex items-center gap-3" aria-label="Account">
          <Link
            to={AUTH_PATHS.LOGIN}
            className="h-10 px-5 border border-white/30 text-white font-display text-sm tracking-[0.16em] uppercase flex items-center hover:border-accent hover:text-accent"
          >
            Login
          </Link>
          <Link
            to={AUTH_PATHS.REGISTER}
            className="h-10 px-5 bg-white text-ink font-display text-sm tracking-[0.16em] uppercase flex items-center hover:bg-accent"
          >
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="px-6 sm:px-10 pt-16 pb-20 max-w-6xl">
          <p className="font-mono text-[11px] tracking-[0.28em] text-accent">CAREER OPERATING SYSTEM</p>
          <h1 className="mt-5 font-display text-5xl sm:text-7xl leading-[0.92] uppercase max-w-4xl">
            Run your job search like a system, not a scramble.
          </h1>
          <p className="mt-6 max-w-2xl text-white/70 text-lg leading-8">
            Career-OS brings jobs, resumes, interviews, and follow-ups into a single workspace. Sign up, verify your
            email, and start with a clean, private session.
          </p>
        </section>

        <section className="grid md:grid-cols-2 border-t border-white/10">
          {FEATURES.map((feature) => (
            <article key={feature.code} className="border-b md:border-r border-white/10 px-6 sm:px-10 py-10">
              <p className="font-mono text-[11px] tracking-[0.22em] text-accent">{feature.code}</p>
              <h2 className="mt-3 font-display text-3xl uppercase">{feature.title}</h2>
              <p className="mt-3 text-white/65 leading-7 max-w-md">{feature.copy}</p>
            </article>
          ))}
        </section>

        <section className="px-6 sm:px-10 py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl uppercase">Ready to initialize?</h2>
            <p className="mt-2 text-white/65">Create an account, verify your inbox, then sign in.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={AUTH_PATHS.REGISTER}
              className="h-11 px-6 bg-accent text-ink font-display tracking-[0.16em] uppercase flex items-center"
            >
              Register
            </Link>
            <Link
              to={AUTH_PATHS.LOGIN}
              className="h-11 px-6 border border-white/30 font-display tracking-[0.16em] uppercase flex items-center"
            >
              Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
