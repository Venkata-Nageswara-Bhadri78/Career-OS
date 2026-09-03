import { useState, useEffect, useRef, startTransition } from "react";
import JobsTable from "../components/main-components/JobsTable";
import AddJobModal from "../components/main-components/AddJobModal";
import DeleteConfirmModal from "../components/main-components/DeleteConfirmModal";
import JobDetailsDrawer from "../components/main-components/JobDetailsDrawer";
import SuccessSnackbar from "../components/main-components/SuccessSnackbar";
import JobTableSkeleton from "../components/skeletons/JobTableSkeleton";
import jobApi from "../api/jobApi";

export default function JobDashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await jobApi.getJobs({
          page,
          size: 10,
          sortBy: "createdAt",
          sortDir: "desc",
        });

        if (!ignore) {
          const content = res?.content || (Array.isArray(res) ? res : []);
          setJobs(content);
          setTotalPages(res?.totalPages ?? 1);
          setTotalElements(res?.totalElements ?? content.length);
        }
      } catch {
        if (!ignore) setJobs([]);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [page]);

  const handleCreateJob = async (jobPayload) => {
    const created = await jobApi.createJob(jobPayload);
    startTransition(() => {
      setJobs((prev) => [created, ...prev]);
      setTotalElements((prev) => prev + 1);
    });
    showSuccessToast("Job added successfully.");
  };

  const showSuccessToast = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSuccessMessage(message);
    toastTimerRef.current = setTimeout(() => setSuccessMessage(null), 3500);
  };

  const dismissSuccessToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSuccessMessage(null);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleDeleteJob = async (jobId) => {
    await jobApi.deleteJob(jobId);
    startTransition(() => {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setTotalElements((prev) => Math.max(0, prev - 1));
    });
  };

  const handleJobFieldUpdated = (updatedJob) => {
    if (!updatedJob?.id) return;
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? { ...j, ...updatedJob } : j)));
  };

  return (
    <>
      <div className="w-full h-full flex flex-col p-2 gap-2">
        {/* Header Title */}
        <div className="flex items-center justify-between px-2 pt-2 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Tracked Opportunities</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage, edit, and interact with your saved job postings with instant auto-save.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xs shrink-0"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add Job</span>
          </button>
        </div>

        {/* Table Area */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
        {isLoading ? (
          <JobTableSkeleton rows={6} />
        ) : (
          <JobsTable
            jobs={jobs}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(newPage) => setPage(newPage)}
            onDeleteClick={(job) => setJobToDelete(job)}
            onViewClick={(jobId) => setSelectedJobId(jobId)}
            onJobFieldUpdated={handleJobFieldUpdated}
          />
        )}
        </div>
      </div>

      {/* Modals & Slide-Over Drawers */}
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateJob}
      />

      <DeleteConfirmModal
        isOpen={Boolean(jobToDelete)}
        job={jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDeleteJob}
      />

      <JobDetailsDrawer
        isOpen={Boolean(selectedJobId)}
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
        onJobUpdated={handleJobFieldUpdated}
      />

      <SuccessSnackbar message={successMessage} onDismiss={dismissSuccessToast} />
    </>
  );
}
