import { formatDate } from "../../jobs/utils/formatters";
import ResumeMatchScore from "../../jobs/components/common/ResumeMatchScore";
import { draftFailureText } from "../mappers/jobDraftMapper";

function CellText({ value }) {
  const text = typeof value === "string" ? value.trim() : "";
  return <span className="block truncate text-xs text-ink">{text || "—"}</span>;
}

export default function JobDraftsTable({ drafts, onView }) {
  if (!drafts.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h3 className="text-sm font-semibold text-ink">No drafts yet</h3>
          <p className="mt-1 text-xs text-muted">
            A draft is kept when a job cannot be saved automatically. You can finish it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full min-w-[1080px] border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-line bg-field/95 backdrop-blur-sm">
            {[
              ["Title", "w-[14%]"],
              ["Company", "w-[10%]"],
              ["Location", "w-[10%]"],
              ["Work mode", "w-[8%]"],
              ["Employment type", "w-[9%]"],
              ["Experience", "w-[8%]"],
              ["Salary", "w-[8%]"],
              ["Source platform", "w-[9%]"],
              ["Failed on", "w-[14%]"],
              ["Score", "w-[5%]"],
              ["Actions", "w-[5%]"],
            ].map(([label, width]) => (
              <th
                key={label}
                className={`px-1.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted ${width} ${
                  label === "Actions" ? "text-right" : ""
                }`}
              >
                {label === "Score" ? <span title="Resume to job score">Score</span> : label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {drafts.map((draft) => {
            const failedOn = formatDate(draft.updatedAt || draft.createdAt);
            const reason = draftFailureText(draft);
            return (
              <tr
                key={draft.id}
                className="cursor-pointer transition-colors hover:bg-field/50"
                onClick={() => onView(draft.id)}
              >
                <td className="max-w-0 px-1.5 py-2 align-top">
                  <CellText value={draft.title} />
                </td>
                <td className="max-w-0 px-1 py-2 align-top">
                  <CellText value={draft.company} />
                </td>
                <td className="max-w-0 px-1 py-2 align-top">
                  <CellText value={draft.location} />
                </td>
                <td className="max-w-0 px-1 py-2 align-top">
                  <CellText value={draft.workMode} />
                </td>
                <td className="max-w-0 px-1 py-2 align-top">
                  <CellText value={draft.employmentType} />
                </td>
                <td className="max-w-0 px-1 py-2 align-top">
                  <CellText value={draft.experience} />
                </td>
                <td className="max-w-0 px-1 py-2 align-top">
                  <CellText value={draft.salary} />
                </td>
                <td className="max-w-0 px-1 py-2 align-top">
                  <CellText value={draft.sourcePlatform} />
                </td>
                <td className="max-w-0 px-1 py-2 align-top">
                  <span className="block text-xs text-ink">{failedOn === "—" && !reason ? "—" : failedOn}</span>
                  {reason ? (
                    <span className="mt-0.5 block truncate text-[10px] text-muted" title={reason}>
                      {reason}
                    </span>
                  ) : null}
                </td>
                <td className="px-1 py-2 align-top">
                  <ResumeMatchScore score={draft.resumeToJobScore} compact />
                </td>
                <td className="px-1 py-2 align-middle text-right" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onView(draft.id)}
                    className="inline-flex h-7 items-center rounded-lg bg-ink px-2.5 text-[11px] font-semibold text-white hover:opacity-90"
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
