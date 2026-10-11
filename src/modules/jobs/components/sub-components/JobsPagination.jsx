export default function JobsPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  itemLabel = "jobs",
}) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(totalElements, (page + 1) * pageSize);
  const pages = Math.max(1, totalPages);

  return (
    <div className="mt-1 flex flex-nowrap items-center justify-between gap-1.5 overflow-x-auto px-2 py-2.5 md:mt-0 md:py-1 border-t border-line bg-field/40 text-[11px] text-muted shrink-0 hide-scrollbar">
      <span className="shrink-0 whitespace-nowrap">
        <strong className="text-ink">{from}</strong> to <strong className="text-ink">{to}</strong> of{" "}
        <strong className="text-ink">{totalElements}</strong> {itemLabel}
      </span>
      <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="px-2 py-0.5 rounded-md border border-line bg-white font-medium text-ink hover:bg-field disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[11px]"
        >
          Previous
        </button>
        <span className="px-1.5 font-medium text-ink text-[11px]">
          {page + 1} of {pages} pages
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-2 py-0.5 rounded-md border border-line bg-white font-medium text-ink hover:bg-field disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[11px]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
