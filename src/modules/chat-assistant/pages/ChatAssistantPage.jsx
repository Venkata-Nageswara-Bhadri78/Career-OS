import { useState, useEffect } from "react";
import ChatSidebar from "../components/main-components/ChatSidebar";
import ChatInterface from "../components/main-components/ChatInterface";
import ChatJobBanner from "../components/main-components/ChatJobBanner";
import JobDetailsDrawer from "../../jobs/components/main-components/JobDetailsDrawer";
import jobApi from "../../jobs/api/jobApi";

export default function ChatAssistantPage({ initialJobId = null }) {
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [job, setJob] = useState(null);
  const [isLoadingJob, setIsLoadingJob] = useState(Boolean(initialJobId));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        {isSidebarOpen && (
          <div className="h-full shrink-0 relative z-20 hidden md:block">
            <ChatSidebar 
              currentJobId={selectedJobId} 
              onSelectJob={handleSelectJob} 
              onChatDeleted={handleChatDeleted}
            />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors bg-white/80"
              title="Close Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"></path>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          </div>
        )}

        {/* Mobile Sidebar overlay */}
        {isSidebarOpen && (
          <div className="md:hidden absolute inset-0 z-40 bg-black/20" onClick={() => setIsSidebarOpen(false)}>
            <div className="h-full bg-white shadow-xl max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
              <ChatSidebar 
                currentJobId={selectedJobId} 
                onSelectJob={handleSelectJob} 
                onChatDeleted={handleChatDeleted}
              />
            </div>
          </div>
        )}

        <ChatInterface 
          jobId={selectedJobId} 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
