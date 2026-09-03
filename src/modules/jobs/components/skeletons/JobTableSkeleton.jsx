export default function JobTableSkeleton({ rows = 6, viewMode = "list" }) {
  if (viewMode === "grid") {
    return (
      <div className="flex-1 min-h-0 rounded-lg border border-line bg-white overflow-hidden p-1.5">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2 animate-pulse">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="rounded-lg border border-line p-2.5 space-y-2">
              <div className="h-3.5 w-3/4 bg-field rounded-md" />
              <div className="h-3 w-1/2 bg-field rounded-md" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-7 bg-field rounded-md" />
                <div className="h-7 bg-field rounded-md" />
                <div className="h-7 bg-field rounded-md" />
                <div className="h-7 bg-field rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 rounded-lg border border-line bg-white overflow-hidden animate-pulse">
      <table className="w-full table-fixed text-left border-collapse">
        <thead>
          <tr className="border-b border-line bg-field/75">
            {Array.from({ length: 9 }).map((_, index) => (
              <th key={index} className="py-1.5 px-1.5">
                <div className="h-2.5 w-12 bg-field rounded-md" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              {Array.from({ length: 9 }).map((__, cellIndex) => (
                <td key={cellIndex} className="py-1 px-1.5">
                  <div className="h-3 w-full max-w-[72px] bg-field rounded-md" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
