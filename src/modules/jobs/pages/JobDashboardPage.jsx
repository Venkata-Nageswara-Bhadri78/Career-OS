import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import { MOBILE_MEDIA_QUERY } from "../../../common/config/shellConfig";
import { useMediaQuery } from "../../../common/hooks/useMediaQuery";
import "../styles/jobs.css";
import JobsToolbar from "../components/sub-components/JobsToolbar";
import JobsBoard from "../components/main-components/JobsBoard";
import DeleteConfirmModal from "../components/main-components/DeleteConfirmModal";
import JobDetailsDrawer from "../components/main-components/JobDetailsDrawer";
import SuccessSnackbar, { toastPositionClass } from "../components/main-components/SuccessSnackbar";
import JobTableSkeleton from "../components/skeletons/JobTableSkeleton";
import useJobsList from "../hooks/useJobsList";
import useJobsViewMode, { useDismissibleMessage } from "../hooks/useJobsViewMode";
import useJobFieldUpdate, { useJobCreate, useJobDelete } from "../hooks/useJobMutations";

export default function JobDashboardPage({ onAddJob, registerCreateJob, openJob = null, onOpenJobHandled }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const {
    jobs,
    page,
    totalPages,
    totalElements,
    isLoading,
    error,
    retryAfter,
    searchInput,
    sortBy,
    sortDir,
    workModeFilter,
    employmentTypeFilter,
    clientFiltersActive,
    handleSearchChange,
    handleSortChange,
    toggleSortDir,
    handleWorkModeFilterChange,
    handleEmploymentTypeFilterChange,
    clearFilters,
    handlePageChange,
    upsertJobInList,
    removeJobFromList,
    prependJob,
  } = useJobsList();

  const { viewMode, displayViewMode, setViewMode } = useJobsViewMode();
  const { message: successMessage, showMessage, dismiss: dismissSuccessToast } = useDismissibleMessage();
  const { createJob } = useJobCreate();
  const { deleteJob } = useJobDelete();

  const [jobToDelete, setJobToDelete] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const handledOpenJobId = useRef(null);

  useEffect(() => {
    if (!openJob?.id) {
      handledOpenJobId.current = null;
      return;
    }
    if (handledOpenJobId.current === openJob.id) return;
    handledOpenJobId.current = openJob.id;
    prependJob(openJob);
    if (isMobile) navigate(APP_PATHS.jobDetails(openJob.id));
    else setSelectedJobId(openJob.id);
    showMessage("Job created successfully.");
    onOpenJobHandled?.();
  }, [isMobile, navigate, onOpenJobHandled, openJob, prependJob, showMessage]);

  const openJobDetails = useCallback(
    (id) => {
      if (isMobile) navigate(APP_PATHS.jobDetails(id));
      else setSelectedJobId(id);
    },
    [isMobile, navigate]
  );

  const handleJobUpdated = useCallback(
    (updatedJob) => {
      upsertJobInList(updatedJob);
    },
    [upsertJobInList]
  );

  const { handleUpdate, handleUndo, undoState, clearUndo } = useJobFieldUpdate(handleJobUpdated);

  const onFieldUpdate = useCallback(
    async (job, fieldKey, updateFn, newValue, label) => {
      setUpdateError(null);
      try {
        await handleUpdate(job, fieldKey, updateFn, newValue, label);
      } catch (err) {
        setUpdateError(err?.message || `Failed to update ${label}.`);
        throw err;
      }
    },
    [handleUpdate]
  );

  const handleDeleteJob = async (jobId) => {
    await deleteJob(jobId);
    startTransition(() => {
      removeJobFromList(jobId);
      if (selectedJobId === jobId) setSelectedJobId(null);
    });
    showMessage("Job deleted successfully.");
  };

  const handleCreateJob = useCallback(
    async (jobPayload) => {
      const created = await createJob(jobPayload);
      startTransition(() => {
        prependJob(created);
      });
      showMessage("Job added successfully.");
      return created;
    },
    [createJob, prependJob, showMessage]
  );

  useEffect(() => {
    if (registerCreateJob) registerCreateJob(handleCreateJob);
  }, [registerCreateJob, handleCreateJob]);

  return (
    <>
      <div className="jobs-panel w-full h-full flex flex-col p-2 pb-0 sm:p-3 sm:pb-1 gap-2 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 shrink-0 px-1">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Job Tracker</h1>
            <p className="text-xs text-muted mt-0.5">
              Track and manage saved job postings with inline edits and instant auto-save.
            </p>
          </div>
          <div className="shrink-0 empty:hidden">
            <SuccessSnackbar message={successMessage} onDismiss={dismissSuccessToast} />
            {undoState ? (
              <div
                className={`${toastPositionClass} flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-ink/90 text-white text-xs shadow-2xl max-md:justify-between`}
              >
                <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                <span className="min-w-0 flex-1 font-medium truncate">Updated {undoState.label}</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await handleUndo();
                    } catch (err) {
                      setUpdateError(err?.message || "Failed to undo change.");
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-ink hover:bg-field active:scale-95 transition-all"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={clearUndo}
                  className="px-1 text-ink bg-white transition-colors rounded-full"
                  title="Dismiss"
                  aria-label="Dismiss undo notification"
                >
                  ✕
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <JobsToolbar
          searchInput={searchInput}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          onToggleSortDir={toggleSortDir}
          workModeFilter={workModeFilter}
          employmentTypeFilter={employmentTypeFilter}
          onWorkModeFilterChange={handleWorkModeFilterChange}
          onEmploymentTypeFilterChange={handleEmploymentTypeFilterChange}
          onClearFilters={clearFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddJob={onAddJob}
          clientFiltersActive={clientFiltersActive}
        />

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {isLoading ? (
            <JobTableSkeleton rows={6} viewMode={displayViewMode} />
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md text-center rounded-2xl border border-line bg-white p-6">
                <p className="text-sm font-semibold text-ink">Unable to load jobs</p>
                <p className="text-xs text-muted mt-2" role="alert">
                  {error}
                </p>
                {retryAfter ? (
                  <p className="text-xs text-muted mt-1">Try again in {retryAfter} seconds.</p>
                ) : null}
              </div>
            </div>
          ) : (
            <JobsBoard
              jobs={jobs}
              viewMode={displayViewMode}
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={handlePageChange}
              onViewClick={openJobDetails}
              onDeleteClick={setJobToDelete}
              onUpdate={onFieldUpdate}
              updateError={updateError}
            />
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(jobToDelete)}
        job={jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDeleteJob}
      />

      {isMobile ? null : (
        <JobDetailsDrawer
          isOpen={Boolean(selectedJobId)}
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
          onJobUpdated={handleJobUpdated}
        />
      )}
    </>
  );
}
