import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jobApi from "../api/jobApi";
import Spinner from "../../../common/components/loaders/Spinner";

export default function JobInteractPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    async function loadJob() {
      try {
        setIsLoading(true);
        const data = await jobApi.getJobById(jobId);
        if (!ignore) {
          setJob(data);
          setMessages([
            {
              id: "msg-welcome",
              sender: "ai",
              text: `Hello! I'm your Career Copilot. I've analyzed your saved role for **${data.title || "this position"}** at **${data.company || "the company"}**.\n\nHow would you like to prepare? You can ask me for interview questions, resume bullet points, cover letters, or compensation strategy.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      } catch {
        if (!ignore) {
          setMessages([
            {
              id: "msg-welcome-fallback",
              sender: "ai",
              text: "Hello! I'm your Career Copilot. Ask me anything about your job applications, interview prep, or career advice.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    if (jobId) loadJob();
    return () => {
      ignore = true;
    };
  }, [jobId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking]);

  const handleSendMessage = (textToSend = inputMessage) => {
    const text = textToSend.trim();
    if (!text || isAiThinking) return;

    const userMsg = {
      id: `user-${messages.length}-${text.slice(0, 8)}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsAiThinking(true);

    setTimeout(() => {
      let reply;
      const lower = text.toLowerCase();

      if (lower.includes("interview") || lower.includes("question")) {
        reply = `Here are targeted interview questions for **${job?.title || "this role"}** based on the required skills (${(job?.skills || ["core technologies"]).join(", ")}):\n\n1. **Architecture & System Design**: How would you design a scalable microservice handling high-throughput requests?\n2. **Technical Deep Dive**: Can you describe a complex problem you solved using ${(job?.skills?.[0] || "modern frameworks")}?\n3. **Behavioral**: Tell me about a time you had to align technical debt with tight delivery deadlines.`;
      } else if (lower.includes("resume") || lower.includes("bullet")) {
        reply = `Here are 3 high-impact resume bullet points tailored for **${job?.company || "this company"}**:\n\n• Architected and deployed scalable backend services using ${(job?.skills?.[0] || "Java/Spring Boot")}, reducing API latency by 35%.\n• Collaborated across engineering teams to deliver mission-critical features with 99.9% uptime.\n• Implemented automated CI/CD pipelines and unit test suites, boosting team deployment frequency by 2x.`;
      } else if (lower.includes("cover letter") || lower.includes("letter")) {
        reply = `**Draft Cover Letter for ${job?.company || "Hiring Team"}:**\n\nDear Hiring Manager,\n\nI am writing to express my strong enthusiasm for the **${job?.title || "Software Engineer"}** position at **${job?.company || "your team"}**. With my proven experience in ${(job?.skills || ["full stack development"]).slice(0, 3).join(", ")}, I am confident in my ability to immediately contribute to your engineering initiatives.\n\nI look forward to discussing how my background aligns with your team's goals.\n\nSincerely,\n[Your Name]`;
      } else if (lower.includes("salary") || lower.includes("negotiat") || lower.includes("pay")) {
        reply = `**Salary Negotiation Strategy for ${job?.salary || "this market range"}:**\n\n1. **Benchmark**: Research total compensation (base + bonus + equity) for ${job?.location || "this region"}.\n2. **Value Proposition**: Highlight specific experience with high-demand skills like ${(job?.skills || []).slice(0, 2).join(" & ")}.\n3. **Tactical Response**: "Based on the scope of this role and market benchmarks, I am targeting the top tier of this range (${job?.salary || "$140k+"})."`;
      } else {
        reply = `Great question regarding **${job?.title || "this position"}**. When applying to **${job?.company || "top tech companies"}**, ensure you emphasize practical projects involving ${(job?.skills || ["your core tech stack"]).slice(0, 3).join(", ")}, measurable business impact, and clear system architecture principles.`;
      }

      const aiMsg = {
        id: `ai-${messages.length}-${text.slice(0, 8)}`,
        sender: "ai",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);
    }, 900);
  };

  const quickPrompts = [
    "Key Interview Questions",
    "Tailored Resume Bullet Points",
    "Draft Cover Letter",
    "Salary Negotiation Strategy",
  ];

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black transition-all shadow-xs"
            >
              ← Back to Jobs
            </button>
            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
            <div>
              <h1 className="text-sm font-bold text-zinc-900 truncate max-w-xs sm:max-w-md">
                {isLoading ? "Loading opportunity..." : job?.title || "Career Copilot"}
              </h1>
              <p className="text-[11px] text-zinc-500 truncate">
                {job?.company ? `${job.company} • ${job.location || "Remote"}` : "AI Copilot Session"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-zinc-900 text-white shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Assistant Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Job Context Banner */}
        {job && (
          <div className="mb-4 p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-zinc-900">{job.title}</span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-600">{job.company}</span>
              {job.salary && (
                <>
                  <span className="text-zinc-400">•</span>
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {job.salary}
                  </span>
                </>
              )}
            </div>
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 5).map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 rounded-2xl bg-white/80 backdrop-blur-md border border-zinc-200 shadow-xs p-4 sm:p-6 flex flex-col justify-between overflow-hidden min-h-115">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="h-7 w-7 rounded-lg bg-black text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-black text-white rounded-br-xs"
                      : "bg-zinc-100 text-zinc-900 border border-zinc-200/70 rounded-bl-xs whitespace-pre-line"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-2 ${
                      msg.sender === "user" ? "text-zinc-400 text-right" : "text-zinc-500"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex gap-3 justify-start">
                <div className="h-7 w-7 rounded-lg bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                  AI
                </div>
                <div className="rounded-2xl p-3.5 bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs flex items-center gap-2">
                  <Spinner className="h-3.5 w-3.5 text-black" />
                  <span>Analyzing application context & formulating answer...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="pt-4 border-t border-zinc-100">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isAiThinking}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black transition-colors disabled:opacity-50"
                >
                  💡 {prompt}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Career Copilot about this role, skills, interview questions, or negotiation..."
                disabled={isAiThinking}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black focus:outline-none transition-all placeholder:text-zinc-400 text-zinc-900"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isAiThinking}
                className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
