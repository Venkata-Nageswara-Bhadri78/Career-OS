import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import AiNavbar from "../components/main-components/AiNavbar";
import AiJobBanner from "../components/main-components/AiJobBanner";
import JobDetailsDrawer from "../../JobService/components/main-components/JobDetailsDrawer";
import AiChatSidebar from "../components/main-components/AiChatSidebar";
import AiChatInterface from "../components/main-components/AiChatInterface";
import AiChatSkeleton from "../components/skeletons/AiChatSkeleton";
import aiApi from "../api/aiApi";
import jobApi from "../../JobService/api/jobApi";
import { AI_MODES, DEFAULT_AI_MODE } from "../helpers/aiModes";
import { formatTime } from "../helpers/aiFormatters";

export default function AiChatPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [isLoadingJob, setIsLoadingJob] = useState(Boolean(jobId));
  const [selectedMode, setSelectedMode] = useState(DEFAULT_AI_MODE);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const abortControllerRef = useRef(null);

  // Load Job context if jobId is present
  useEffect(() => {
    let ignore = false;

    async function loadJobContext() {
      if (!jobId) {
        setIsLoadingJob(false);
        setMessages([
          {
            id: "msg-welcome-general",
            role: "assistant",
            sender: "ai",
            mode: AI_MODES.GENERAL_CHAT,
            content:
              "Hello! I'm your **Career Copilot**. I am connected to your candidate profile and ready to help you with job match evaluations, resume optimization, cover letters, and interview preparation.\n\nWhat would you like to work on today?",
            timestamp: formatTime(),
          },
        ]);
        return;
      }

      try {
        setIsLoadingJob(true);
        const data = await jobApi.getJobById(jobId);
        if (!ignore) {
          setJob(data);
          setMessages([
            {
              id: "msg-welcome-job",
              role: "assistant",
              sender: "ai",
              mode: selectedMode,
              content: `Hello! I'm your **Career Copilot**. I've synchronized your resume profile with the target role for **${
                data.title || "this position"
              }** at **${data.company || "the company"}**.\n\nYou can ask me to run a **Match Analysis**, rewrite **Resume Bullet Points** using Google's X-Y-Z formula, draft a **Cold Outreach Email**, or predict **Interview Questions** with STAR model answers.`,
              timestamp: formatTime(),
            },
          ]);
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Failed to load job details for AI interaction:", err);
          setMessages([
            {
              id: "msg-welcome-fallback",
              role: "assistant",
              sender: "ai",
              mode: selectedMode,
              content:
                "Hello! I'm your **Career Copilot**. How can I help you prepare for your applications, technical interviews, or resume improvements today?",
              timestamp: formatTime(),
            },
          ]);
        }
      } finally {
        if (!ignore) setIsLoadingJob(false);
      }
    }

    loadJobContext();
    return () => {
      ignore = true;
    };
  }, [jobId]);

  // Handle New Chat Session
  const handleNewChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setErrorMessage(null);

    const welcomeContent = job
      ? `Started a fresh session for **${job.title}** at **${job.company}**. How can I assist you?`
      : "Started a fresh Career Copilot session. Ask anything about your career or job search.";

    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: "assistant",
        sender: "ai",
        mode: selectedMode,
        content: welcomeContent,
        timestamp: formatTime(),
      },
    ]);
  };

  // Stop Generation
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Handle Send Message & Stream Tokens
  const handleSendMessage = async (promptText) => {
    if (!promptText || isStreaming) return;

    setErrorMessage(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      sender: "user",
      content: promptText,
      timestamp: formatTime(),
    };

    const assistantMessageId = `ai-${Date.now()}`;
    const initialAssistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      sender: "ai",
      mode: selectedMode,
      content: "",
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const payload = {
      prompt: promptText,
      jobId: jobId ? Number(jobId) : null,
      jobDescription: job ? (job.description || job.originalDescription || `${job.title} at ${job.company}`) : null,
      mode: selectedMode,
      temperature: 0.7,
    };

    await aiApi.streamChat(
      payload,
      {
        onToken: (_delta, accumulatedText) => {
          setMessages((prev) => {
            const updated = [...prev];
            const targetIdx = updated.findIndex((m) => m.id === assistantMessageId);
            if (targetIdx !== -1) {
              updated[targetIdx] = {
                ...updated[targetIdx],
                content: accumulatedText,
              };
            }
            return updated;
          });
        },
        onComplete: (fullText) => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          setMessages((prev) => {
            const updated = [...prev];
            const targetIdx = updated.findIndex((m) => m.id === assistantMessageId);
            if (targetIdx !== -1) {
              updated[targetIdx] = {
                ...updated[targetIdx],
                content: fullText,
              };
            }
            return updated;
          });
        },
        onError: (err) => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          setErrorMessage(err.message || "Failed to generate AI response.");
          setMessages((prev) => {
            const updated = [...prev];
            const targetIdx = updated.findIndex((m) => m.id === assistantMessageId);
            if (targetIdx !== -1 && !updated[targetIdx].content) {
              updated[targetIdx] = {
                ...updated[targetIdx],
                content: `⚠️ **Error:** ${err.message || "An unexpected error occurred while contacting the AI Service."}`,
              };
            }
            return updated;
          });
        },
      },
      { signal: controller.signal }
    );
  };

  // Handle Retry: Remove inaccurate/error assistant response and re-generate from the last user prompt
  const handleRetry = async () => {
    if (isStreaming) return;
    setErrorMessage(null);

    // Find the last user message index
    const lastUserIdx = messages.map((m) => m.role === "user" || m.sender === "user").lastIndexOf(true);
    if (lastUserIdx === -1) return;

    const userPrompt = messages[lastUserIdx].content || messages[lastUserIdx].text;
    if (!userPrompt) return;

    // Prune any assistant responses after this user prompt so it regenerates cleanly
    const prunedMessages = messages.slice(0, lastUserIdx + 1);

    const assistantMessageId = `ai-${Date.now()}`;
    const initialAssistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      sender: "ai",
      mode: selectedMode,
      content: "",
      timestamp: formatTime(),
    };

    setMessages([...prunedMessages, initialAssistantMessage]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const payload = {
      prompt: userPrompt,
      jobId: jobId ? Number(jobId) : null,
      jobDescription: job ? (job.description || job.originalDescription || `${job.title} at ${job.company}`) : null,
      mode: selectedMode,
      temperature: 0.7,
    };

    await aiApi.streamChat(
      payload,
      {
        onToken: (_delta, accumulatedText) => {
          setMessages((prev) => {
            const updated = [...prev];
            const targetIdx = updated.findIndex((m) => m.id === assistantMessageId);
            if (targetIdx !== -1) {
              updated[targetIdx] = {
                ...updated[targetIdx],
                content: accumulatedText,
              };
            }
            return updated;
          });
        },
        onComplete: (fullText) => {
          setIsStreaming(false);
          setErrorMessage(null);
          abortControllerRef.current = null;
          setMessages((prev) => {
            const updated = [...prev];
            const targetIdx = updated.findIndex((m) => m.id === assistantMessageId);
            if (targetIdx !== -1) {
              updated[targetIdx] = {
                ...updated[targetIdx],
                content: fullText,
              };
            }
            return updated;
          });
        },
        onError: (err) => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          setErrorMessage(err.message || "Failed to generate AI response.");
          setMessages((prev) => {
            const updated = [...prev];
            const targetIdx = updated.findIndex((m) => m.id === assistantMessageId);
            if (targetIdx !== -1 && !updated[targetIdx].content) {
              updated[targetIdx] = {
                ...updated[targetIdx],
                content: `⚠️ **Error:** ${err.message || "An unexpected error occurred while contacting the AI Service."}`,
              };
            }
            return updated;
          });
        },
      },
      { signal: controller.signal }
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white font-sans text-zinc-900 overflow-hidden select-none">
      {/* 1. Global Independent Navbar */}
      <AiNavbar />

      {/* 2. Sub-Bar: Opportunity Brief & View Full Details trigger */}
      <AiJobBanner
        job={job}
        isLoading={isLoadingJob}
        onOpenDetails={() => setIsJobModalOpen(true)}
      />

      {/* 3. Main Workspace: Chat Sidebar + Chat Interface */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left History & Mode Sidebar */}
        <AiChatSidebar
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
          selectedMode={selectedMode}
          onSelectMode={(mode) => setSelectedMode(mode)}
          onNewChat={handleNewChat}
          activeJobTitle={job?.title}
        />

        {/* Right Main Chat Interface */}
        {isLoadingJob ? (
          <AiChatSkeleton />
        ) : (
          <AiChatInterface
            messages={messages}
            isStreaming={isStreaming}
            selectedMode={selectedMode}
            onSelectMode={(mode) => setSelectedMode(mode)}
            onSendMessage={handleSendMessage}
            onRetry={handleRetry}
            onStopStreaming={handleStopStreaming}
            errorMessage={errorMessage}
            job={job}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
      </div>

      {/* 4. Unified Complete Job Details Drawer Modal */}
      <JobDetailsDrawer
        isOpen={isJobModalOpen}
        job={job}
        jobId={jobId}
        onClose={() => setIsJobModalOpen(false)}
        onJobUpdated={(updatedJob) => setJob(updatedJob)}
      />
    </div>
  );
}
