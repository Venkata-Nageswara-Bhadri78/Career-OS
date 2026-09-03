import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg text-ink px-6 py-12 max-w-3xl mx-auto">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">Career-OS</p>
      <h1 className="mt-3 font-display text-4xl uppercase">Terms</h1>
      <p className="mt-4 text-muted leading-7">
        This placeholder exists so registration can link to a real route. Replace this copy with your production terms
        before launch.
      </p>
      <Link to="/register" className="inline-block mt-8 text-sm font-semibold underline">
        Back to register
      </Link>
    </main>
  );
}
