import AiInlineText from "../sub-components/AiInlineText";

export default function AiTableBlock({ lines = [] }) {
  if (!lines || lines.length < 2) return null;

  const cellsOf = (row) =>
    row
      .split("|")
      .map((cell) => cell.trim())
      .filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);

  const headerCells = cellsOf(lines[0]);
  const rows = lines.slice(2).map(cellsOf);

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-line ai-scroll">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-field border-b border-line text-ink font-bold">
          <tr>
            {headerCells.map((cell, index) => (
              <th key={index} className="py-2 px-3">
                <AiInlineText text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => (
                <td key={colIdx} className="py-2 px-3 text-ink/80">
                  <AiInlineText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
