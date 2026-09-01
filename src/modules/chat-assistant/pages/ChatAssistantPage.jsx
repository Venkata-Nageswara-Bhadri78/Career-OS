import { useState, useEffect } from "react";
import ChatInterface from "../components/main-components/ChatInterface";
import ChatJobBanner from "../components/main-components/ChatJobBanner";
import JobDetailsDrawer from "../../jobs/components/main-components/JobDetailsDrawer";
import jobApi from "../../jobs/api/jobApi";

export default function ChatAssistantPage({ initialJobId = null }) {
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [job, setJob] = useState(null);
  const [isLoadingJob, setIsLoadingJob] = useState(Boolean(initialJobId));
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadJobContext() {
      if (!selectedJobId) {
        setIsLoadingJob(false);
        setJob(null);
        return;
      }
      try {
        setIsLoadingJob(true);
        const data = await jobApi.getJobById(selectedJobId);
        if (!ignore) {
          setJob(data);
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Failed to load job details:", err);
          setJob(null);
        }
      } finally {
        if (!ignore) setIsLoadingJob(false);
      }
    }
    loadJobContext();
    return () => { ignore = true; };
  }, [selectedJobId]);

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
  };

  const handleChatDeleted = (jobId) => {
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white font-sans text-zinc-900 overflow-hidden select-none rounded-xl border border-zinc-200 shadow-sm">
      <ChatJobBanner
        job={job}
        isLoading={isLoadingJob}
        onOpenDetails={() => setIsJobModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <ChatInterface 
          jobId={selectedJobId} 
          isSidebarOpen={true}
          onToggleSidebar={() => {}}
        />
      </div>

      <JobDetailsDrawer
        isOpen={isJobModalOpen}
        job={job}
        jobId={selectedJobId}
        onClose={() => setIsJobModalOpen(false)}
        onJobUpdated={(updatedJob) => setJob(updatedJob)}
      />
    </div>
  );
}
