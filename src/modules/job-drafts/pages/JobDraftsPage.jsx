import { useNavigate, useParams } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import JobsPagination from "../../jobs/components/sub-components/JobsPagination";
import { JOB_DRAFT_SORT_OPTIONS, JOB_DRAFTS_PAGE_SIZE } from "../config/jobDraftConfig";
import JobDraftEditor from "../components/JobDraftEditor";
import JobDraftsTable from "../components/JobDraftsTable";
import useJobDrafts from "../hooks/useJobDrafts";

const controlClass =
  "h-8 rounded-lg border border-line bg-white px-2 text-[11px] text-ink focus:border-ink focus:outline-none";

function parseDraftId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default function JobDraftsPage() {
  const { draftId: draftIdParam } = useParams();
  const navigate = useNavigate();
  const list = useJobDrafts();
  const draftId = draftIdParam == null ? null : parseDraftId(draftIdParam);
  const invalidId = draftIdParam != null && draftId == null;

  const closeEditor = () => navigate(APP_PATHS.JOB_DRAFTS);

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2 overflow-hidden p-2 sm:p-3">
      <div className="px-1">
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Job Drafts</h1>
        <p className="mt-0.5 text-xs text-muted">
          Incomplete job details that couldn&apos;t be saved. You can review or complete them later.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5 px-0.5">
        <select
          value={list.sortBy}
          onChange={(event) => list.handleSortChange(event.target.value)}
          aria-label="Sort drafts by"
          className={`${controlClass} min-w-[140px] font-medium`}
        >
          {JOB_DRAFT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={list.toggleSortDir}
          aria-label={`Sort direction: ${list.sortDir === "asc" ? "ascending" : "descending"}`}
          className={`${controlClass} min-w-[68px] font-semibold`}
        >
          {list.sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white">
        {list.isLoading ? (
          <div className="flex flex-1 items-center justify-center text-xs text-muted">Loading drafts…</div>
        ) : list.error ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="max-w-md rounded-2xl border border-line bg-white p-6 text-center">
              <p className="text-sm font-semibold text-ink">Unable to load drafts</p>
              <p className="mt-2 text-xs text-muted" role="alert">
                {list.error}
              </p>
              {list.retryAfter ? <p className="mt-1 text-xs text-muted">Try again in {list.retryAfter} seconds.</p> : null}
              <button
                type="button"
                onClick={list.reload}
                className="mt-3 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <JobDraftsTable drafts={list.drafts} onView={(id) => navigate(`${APP_PATHS.JOB_DRAFTS}/${id}`)} />
        )}
        {!list.isLoading && !list.error && list.totalElements > 0 ? (
          <JobsPagination
            page={list.page}
            totalPages={list.totalPages}
            totalElements={list.totalElements}
            pageSize={JOB_DRAFTS_PAGE_SIZE}
            onPageChange={list.handlePageChange}
            itemLabel="drafts"
          />
        ) : null}
      </div>

      {invalidId ? (
        <div className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger" role="alert">
          This draft is unavailable.
          <button type="button" onClick={closeEditor} className="ml-2 font-semibold text-ink">
            Back to drafts
          </button>
        </div>
      ) : null}

      <JobDraftEditor
        isOpen={Boolean(draftId)}
        draftId={draftId}
        onClose={closeEditor}
        onUpdated={list.replaceDraft}
        onDeleted={list.removeDraft}
        onSavedJob={(job) => navigate(APP_PATHS.DASHBOARD, { state: { openJob: job } })}
      />
    </div>
  );
}
