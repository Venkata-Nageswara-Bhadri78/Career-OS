import { useState, useRef } from "react";

export default function ChatInputBar({ onSend, isLoading }) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onSend(prompt.trim());
      setPrompt("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md px-4 sm:px-8 md:px-12 pb-5 pt-2">
      <div className="max-w-3xl sm:max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="relative flex items-end gap-3 rounded-2xl border border-zinc-300/90 bg-[#f8f8f8] hover:bg-white focus-within:bg-white focus-within:border-zinc-400 focus-within:shadow-md transition-all px-4 py-2.5"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask anything..."
            className="flex-1 max-h-48 py-1 text-[15px] bg-transparent focus:outline-none resize-none placeholder:text-zinc-400 text-zinc-900 leading-relaxed font-normal"
          />

          <div className="flex items-center gap-2 shrink-0 self-end pb-0.5">
            <button
              type="button"
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
              title="Voice input"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {isLoading ? (
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-xs cursor-wait"
                title="Generating..."
                disabled
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
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
  );
}
