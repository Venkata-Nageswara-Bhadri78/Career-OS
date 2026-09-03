import { AUTH_CONFIG } from "../../config/authConfig";

const SIGNAL_BARS = [18, 28, 22, 40, 32, 48, 36, 58, 44, 70, 52, 64, 38, 46, 30, 42, 24, 34, 20, 26];

export default function AuthBrandPanel() {
  return (
    <aside className="relative hidden lg:flex w-[62%] shrink-0 h-full flex-col bg-ink text-white overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-8 xl:px-12 pt-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="relative h-7 w-7 border border-white/90">
            <span className="absolute inset-[6px] bg-white" />
          </span>
          <span className="font-display text-[20px] tracking-[0.12em]">CAREER-OS</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.18em] text-white/70">
          <span>SYS.VER // {AUTH_CONFIG.systemVersion}</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            GRID ONLINE
          </span>
        </div>
      </header>

      <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-center px-8 xl:px-12 max-w-4xl">
        <p className="inline-flex w-fit items-center border border-white/25 px-3 py-1 font-mono text-[10px] tracking-[0.28em] text-white/80">
          [ SIMULATION PROTOCOL ]
        </p>
        <h1 className="mt-4 font-display text-[44px] xl:text-[60px] leading-[0.92] tracking-[-0.03em] uppercase">
          Engineer the
          <br />
          future in
          <br />
          real-time
        </h1>
        <p className="mt-4 max-w-xl text-[14px] leading-6 text-white/70">
          Join a high-performance workspace designed for job tracking, resume optimization, interview preparation, and
          application telemetry — all in one operating system for your career.
        </p>

        <div className="mt-6 grid grid-cols-[1.6fr_1fr_1fr] gap-3 max-w-3xl">
          <article className="border border-white/15 bg-white/5 p-3">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-white/55">
              <span>SIGNAL OSCILLATION</span>
              <span>CH_A1</span>
            </div>
            <div className="relative mt-3 h-12 flex items-end gap-[3px]">
              {SIGNAL_BARS.map((height, index) => (
                <span
                  key={`bar-${index}`}
                  className="flex-1 bg-white/80"
                  style={{ height: `${height}%`, opacity: index === 11 ? 1 : 0.55 }}
                />
              ))}
              <span className="absolute inset-y-0 left-[58%] w-px bg-white" />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-white/50">
              <span>FREQ: 432.8HZ</span>
              <span>STATUS: SYNCHRONIZED</span>
            </div>
          </article>

          <article className="border border-white/15 bg-white/5 p-3 flex flex-col justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-white/55">LATENCY INTERVAL</p>
            <p className="font-display text-[30px] leading-none">0.12 MS</p>
          </article>

          <article className="border border-white/15 bg-white/5 p-3 flex flex-col justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-white/55">THROUGHPUT VOLUME</p>
            <p className="font-display text-[30px] leading-none">84.9 GB/S</p>
          </article>
        </div>
      </div>

      <footer className="relative z-10 flex items-center justify-between px-8 xl:px-12 pb-5 font-mono text-[10px] tracking-[0.18em] text-white/50 shrink-0">
        <span>© CAREER-OS</span>
        <div className="flex items-center gap-8">
          <span>MEMBER OF CAREER-OS</span>
          <span>LOC // UTC_00</span>
        </div>
      </footer>
    </aside>
  );
}
