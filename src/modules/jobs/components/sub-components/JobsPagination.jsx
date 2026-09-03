export default function JobsPagination({ page, totalPages, totalElements, pageSize, onPageChange }) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(totalElements, (page + 1) * pageSize);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-2 py-1.5 border-t border-line bg-field/40 text-[11px] text-muted shrink-0">
      <span>
        Showing <strong className="text-ink">{from}</strong> to <strong className="text-ink">{to}</strong> of{" "}
        <strong className="text-ink">{totalElements}</strong> saved jobs
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="px-2 py-0.5 rounded-md border border-line bg-white font-medium text-ink hover:bg-field disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[11px]"
        >
          Previous
        </button>
        <span className="px-1.5 font-medium text-ink text-[11px]">
          Page {page + 1} of {Math.max(1, totalPages)}
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
