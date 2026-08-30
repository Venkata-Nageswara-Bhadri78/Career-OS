import { useState } from "react";
import { copyToClipboard } from "../../helpers/formatters";

export default function ChatCodeBlock({ code = "", language = "text" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px]">
        <span className="font-mono text-zinc-400 uppercase font-semibold tracking-wider">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {copied ? (
            <>
              <span className="text-emerald-400 font-semibold">✓ Copied!</span>
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code contents */}
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
