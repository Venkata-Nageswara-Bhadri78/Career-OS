import ChatInlineText from "./ChatInlineText";

export default function ChatTableBlock({ lines = [] }) {
  if (!lines || lines.length < 2) return null;

  const headerCells = lines[0]
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell, idx, arr) => idx !== 0 && idx !== arr.length - 1);

  const rows = lines.slice(2).map((rowStr) =>
    rowStr
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell, idx, arr) => idx !== 0 && idx !== arr.length - 1)
  );

  return (
    <div className="chat-table-wrap my-3 overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-xs border-collapse min-w-[30rem]">
        <thead className="bg-field border-b border-line text-ink font-bold">
          <tr>
            {headerCells.map((header, i) => (
              <th key={i} className="py-2 px-3 whitespace-nowrap">
                <ChatInlineText text={header} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-bg">
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-field/70">
              {row.map((cell, colIdx) => (
                <td key={colIdx} className="py-2 px-3 text-ink/80">
                  <ChatInlineText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
