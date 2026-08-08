import { useState, useEffect, startTransition } from "react";
import JobNavbar from "../components/main-components/JobNavbar";
import JobsTable from "../components/main-components/JobsTable";
import AddJobModal from "../components/main-components/AddJobModal";
import DeleteConfirmModal from "../components/main-components/DeleteConfirmModal";
import JobDetailsDrawer from "../components/main-components/JobDetailsDrawer";
import JobTableSkeleton from "../components/skeletons/JobTableSkeleton";
import jobApi from "../api/jobApi";

export default function JobDashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await jobApi.getJobs({
          search: search.trim() || undefined,
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
  }, [search, page]);

  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(0);
  };

  const handleCreateJob = async (jobPayload) => {
    const created = await jobApi.createJob(jobPayload);
    startTransition(() => {
      setJobs((prev) => [created, ...prev]);
      setTotalElements((prev) => prev + 1);
    });
  };

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
    <div className="min-h-screen bg-zinc-100 font-sans text-black flex flex-col">
      <JobNavbar
        search={search}
        onSearchChange={handleSearchChange}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Header Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Tracked Opportunities</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage, edit, and interact with your saved job postings with instant auto-save.
          </p>
        </div>

        {/* Table Area */}
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
      </main>

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
    </div>
  );
}
