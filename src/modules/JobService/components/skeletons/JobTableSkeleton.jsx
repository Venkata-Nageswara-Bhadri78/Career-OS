export default function JobTableSkeleton({ rows = 6 }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 backdrop-blur-md shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/75">
              <th className="py-3.5 px-4 font-semibold text-zinc-400 w-[24%]">Role & Company</th>
              <th className="py-3.5 px-4 font-semibold text-zinc-400 w-[14%]">Location</th>
              <th className="py-3.5 px-4 font-semibold text-zinc-400 w-[14%]">Work Mode / Type</th>
              <th className="py-3.5 px-4 font-semibold text-zinc-400 w-[14%]">Salary & Exp</th>
              <th className="py-3.5 px-4 font-semibold text-zinc-400 w-[22%]">Skills</th>
              <th className="py-3.5 px-4 font-semibold text-zinc-400 w-[12%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="py-3 px-4 w-[24%]">
                  <div className="h-4 w-36 bg-zinc-200 rounded-md mb-1.5" />
                  <div className="h-3 w-24 bg-zinc-100 rounded-md" />
                </td>
                <td className="py-3 px-4 w-[14%]">
                  <div className="h-3.5 w-28 bg-zinc-200 rounded-md" />
                </td>
                <td className="py-3 px-4 w-[14%]">
                  <div className="flex gap-1.5">
                    <div className="h-5 w-14 bg-zinc-200 rounded-md" />
                    <div className="h-5 w-16 bg-zinc-100 rounded-md" />
                  </div>
                </td>
                <td className="py-3 px-4 w-[14%]">
                  <div className="h-3.5 w-20 bg-zinc-200 rounded-md mb-1" />
                  <div className="h-3 w-16 bg-zinc-100 rounded-md" />
                </td>
                <td className="py-3 px-4 w-[22%]">
                  <div className="flex flex-wrap gap-1">
                    <div className="h-5 w-12 bg-zinc-200 rounded-md" />
                    <div className="h-5 w-16 bg-zinc-200 rounded-md" />
                    <div className="h-5 w-10 bg-zinc-100 rounded-md" />
                  </div>
                </td>
                <td className="py-3 px-4 w-[12%] text-right">
                  <div className="inline-flex gap-2 justify-end">
                    <div className="h-7 w-7 bg-zinc-200 rounded-lg" />
                    <div className="h-7 w-7 bg-zinc-100 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
