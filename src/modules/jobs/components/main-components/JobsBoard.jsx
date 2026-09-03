import { JOBS_PAGE_SIZE } from "../../config/jobsConfig";
import JobsPagination from "../sub-components/JobsPagination";
import JobsGridView from "./JobsGridView";
import JobsListView from "./JobsListView";

export default function JobsBoard({
  jobs,
  viewMode,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onViewClick,
  onDeleteClick,
  onUpdate,
  updateError,
}) {
  const ViewComponent = viewMode === "grid" ? JobsGridView : JobsListView;

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-lg border border-line bg-white overflow-hidden">
      <ViewComponent
        jobs={jobs}
        onViewClick={onViewClick}
        onDeleteClick={onDeleteClick}
        onUpdate={onUpdate}
        updateError={updateError}
      />
      <JobsPagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={JOBS_PAGE_SIZE}
        onPageChange={onPageChange}
      />
    </div>
  );
}
