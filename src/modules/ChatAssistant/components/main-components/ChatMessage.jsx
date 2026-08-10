import { useState } from "react";
import ChatMarkdownRenderer from "../markdown/ChatMarkdownRenderer";

export default function ChatMessage({ isAi, content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  const checkIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  if (!isAi) {
    return (
      <div className="group flex w-full flex-col items-end gap-1 px-4 py-6 md:px-6">
        <div className="relative flex max-w-[85%] flex-col items-end">
          <div className="bg-zinc-100 px-5 py-3.5 rounded-3xl rounded-tr-sm text-zinc-900 text-[15px] leading-relaxed max-h-37.5 overflow-y-auto whitespace-pre-wrap wrap-break-word shadow-sm">
            {content}
          </div>
          <button
            onClick={handleCopy}
            className="absolute -left-10 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-zinc-400 hover:text-zinc-700 bg-white rounded-md shadow-sm border border-zinc-200"
            title="Copy"
          >
            {copied ? checkIcon : copyIcon}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex w-full gap-4 px-4 py-6 md:px-6 hover:bg-zinc-50/50 transition-colors">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-black text-white shadow-sm mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8"></path>
          <rect x="4" y="8" width="16" height="12" rx="2"></rect>
          <path d="M2 14h2"></path>
          <path d="M20 14h2"></path>
          <path d="M15 13v2"></path>
          <path d="M9 13v2"></path>
        </svg>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden max-w-4xl pt-1">
        <ChatMarkdownRenderer content={content} />
        <div className="pt-2 flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors py-1 px-2 -ml-2 rounded-md hover:bg-zinc-100"
          >
            {copied ? checkIcon : copyIcon}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
