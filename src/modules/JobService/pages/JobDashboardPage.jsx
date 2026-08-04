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

  const remoteCount = jobs.filter((j) => (j.workMode || "").toLowerCase().includes("remote")).length;
  const fullTimeCount = jobs.filter((j) => (j.employmentType || "").toLowerCase().includes("full")).length;

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-black flex flex-col">
      <JobNavbar
        search={search}
        onSearchChange={handleSearchChange}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Stats & Quick Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Tracked Opportunities</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage, edit, and monitor your target job listings with instant auto-save.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-zinc-200 shadow-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-black" />
              <span className="text-xs text-zinc-500 font-medium">Total:</span>
              <span className="text-xs font-bold text-zinc-900">{totalElements}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-zinc-200 shadow-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              <span className="text-xs text-zinc-500 font-medium">Remote:</span>
              <span className="text-xs font-bold text-zinc-900">{remoteCount}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-zinc-200 shadow-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-300" />
              <span className="text-xs text-zinc-500 font-medium">Full Time:</span>
              <span className="text-xs font-bold text-zinc-900">{fullTimeCount}</span>
            </div>
          </div>
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
