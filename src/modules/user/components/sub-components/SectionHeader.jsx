export default function SectionHeader({ icon, title, meta, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        {icon ? <span className="hidden text-ink/70 sm:inline [&_svg]:h-5 [&_svg]:w-5">{icon}</span> : null}
        <h2 className="truncate text-sm font-bold tracking-tight text-ink sm:text-lg">{title}</h2>
        {meta ? (
          <span className="shrink-0 rounded-full bg-field px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:px-2 sm:text-[11px]">
            {meta}
          </span>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
