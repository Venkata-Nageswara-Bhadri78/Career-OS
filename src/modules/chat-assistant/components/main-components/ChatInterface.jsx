import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInputBar from "./ChatInputBar";
import { fetchJobChatHistory, sendJobChatMessage } from "../../api/chatAssistantApi";
import ChatSkeleton from "../skeletons/ChatSkeleton";
import { emitShellEvent, SHELL_EVENTS } from "../../../../common/utils/shellEvents";

export default function ChatInterface({ jobId, onChatUpdated }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (jobId) {
      const loadHistory = async () => {
        setIsLoading(true);
        try {
          const response = await fetchJobChatHistory(jobId);
          if (response?.success && response.data?.messages) {
            const history = response.data.messages.flatMap((m) => [
              { type: "user", content: m.userPrompt, turn: m.turnNumber },
              { type: "ai", content: m.aiResponse, turn: m.turnNumber }
            ]);
            setMessages(history);
          } else {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setMessages([]);
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadHistory();
    } else {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setMessages([]);
    }
  }, [jobId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSendMessage = async (prompt) => {
    if (!jobId) return;

    // Optimistically add user message
    const tempTurn = messages.length > 0 ? Math.floor(messages.length / 2) + 1 : 1;
    setMessages((prev) => [...prev, { type: "user", content: prompt, turn: tempTurn }]);
    setIsSending(true);

    try {
      const response = await sendJobChatMessage(jobId, prompt);
      if (response?.success && response.data?.latestTurn) {
        const { latestTurn } = response.data;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { type: "user", content: latestTurn.userPrompt, turn: latestTurn.turnNumber },
          { type: "ai", content: latestTurn.aiResponse, turn: latestTurn.turnNumber }
        ]);
        emitShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED);
        if (onChatUpdated) {
          onChatUpdated();
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on failure
      setMessages((prev) => prev.slice(0, -1));
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (!jobId && isLoading) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6"
      >
        <div className="max-w-3xl sm:max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex flex-col gap-8 p-6 items-center justify-center h-full min-h-[50vh]">
              <div className="flex gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6 space-y-4 animate-in fade-in duration-200">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xl font-bold text-zinc-900 shadow-2xs">
                ✨
              </div>
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
                What can I help you with today?
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
                Ask anything about {jobId ? "this job opportunity" : "your career"}, salary negotiation, interview questions, or your skill fit.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage 
                  key={`${msg.turn}-${msg.type}-${idx}`} 
                  isAi={msg.type === "ai"} 
                  content={msg.content} 
                />
              ))}
              {isSending && (
                <div className="px-4 py-6 md:px-6 flex gap-4 w-full">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black shadow-sm mt-1">
                    <svg className="text-white w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8V4H8"></path>
                      <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                      <path d="M2 14h2"></path>
                      <path d="M20 14h2"></path>
                      <path d="M15 13v2"></path>
                      <path d="M9 13v2"></path>
                    </svg>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block h-3 w-1.5 bg-black animate-pulse ml-0.5"></span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="w-full relative z-10">
        <ChatInputBar onSend={handleSendMessage} isLoading={isSending || isLoading} />
      </div>
    </div>
  );
}
