import { useState, useRef, useEffect } from "react";
import AiMessageItem from "./AiMessageItem";
import AiThinkingIndicator from "../loaders/AiThinkingIndicator";
import { getModeConfig } from "../../helpers/aiModes";
import { getSuggestionsForMode } from "../../helpers/aiPrompts";

export default function AiChatInterface({
  messages = [],
  isStreaming = false,
  selectedMode,
  onSelectMode,
  onSendMessage,
  onRetry,
  onStopStreaming,
  errorMessage = null,
  job = null,
  isSidebarOpen = true,
  onToggleSidebar = () => {},
}) {
  const [inputPrompt, setInputPrompt] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const currentModeConfig = getModeConfig(selectedMode);
  const suggestions = getSuggestionsForMode(selectedMode);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = (textToSend = inputPrompt) => {
    const text = typeof textToSend === "string" ? textToSend.trim() : inputPrompt.trim();
    if (!text || isStreaming) return;
    onSendMessage(text);
    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setInputPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Reopen Sidebar button when sidebar is collapsed */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Open Sidebar"
          className="absolute top-3 left-3 z-30 p-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100 hover:shadow-xs transition-all flex items-center gap-1.5 text-xs font-medium"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className="hidden sm:inline">Sidebar</span>
        </button>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6">
        <div className="max-w-3xl sm:max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6 space-y-4 animate-in fade-in duration-200">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xl font-bold text-zinc-900 shadow-2xs">
                ✨
              </div>
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
                What can I help you with today?
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
                Ask anything about {job?.title ? `the ${job.title} position at ${job.company || "this company"}` : "this job opportunity"}, salary negotiation, interview questions, or your skill fit.
              </p>

              {/* Starter Suggestion Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {suggestions.slice(0, 4).map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSubmit(suggestion)}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black transition-colors border border-zinc-200/80 shadow-2xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const isLatestAiMessage =
              !msg.isUser &&
              msg.sender !== "user" &&
              msg.role !== "user" &&
              index === messages.length - 1;

            return (
              <AiMessageItem
                key={msg.id || index}
                message={msg}
                isLatestStreaming={isLatestAiMessage && isStreaming}
              />
            );
          })}

          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <AiThinkingIndicator mode={currentModeConfig.label} />
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="font-bold">Notice:</span>
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={onRetry || (() => handleSubmit(messages[messages.length - 1]?.content || "Retry"))}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0 shadow-2xs"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Floating/Fixed Input Bar matching screenshot */}
      <div className="w-full bg-white/95 backdrop-blur-md px-4 sm:px-8 md:px-12 pb-5 pt-2">
        <div className="max-w-3xl sm:max-w-4xl mx-auto">
          {/* Input Form Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="relative flex items-end gap-3 rounded-2xl border border-zinc-300/90 bg-[#f8f8f8] hover:bg-white focus-within:bg-white focus-within:border-zinc-400 focus-within:shadow-md transition-all px-4 py-2.5"
          >
            {/* Auto-growing Text Area */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask anything..."
              className="flex-1 max-h-48 py-1 text-[15px] bg-transparent focus:outline-none resize-none placeholder:text-zinc-400 text-zinc-900 leading-relaxed font-normal"
            />

            {/* Right Action Icons (Mic & Send / Stop) - Bottom Anchored */}
            <div className="flex items-center gap-2 shrink-0 self-end pb-0.5">
              {/* Mic Icon */}
              <button
                type="button"
                className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
                title="Voice input"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopStreaming}
                  className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-xs"
                  title="Stop generating"
                >
                  <span className="h-2.5 w-2.5 rounded-2xs bg-white" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputPrompt.trim()}
                  className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
