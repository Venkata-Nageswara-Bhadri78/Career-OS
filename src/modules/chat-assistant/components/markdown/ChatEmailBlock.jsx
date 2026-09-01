import { useState } from "react";
import { copyToClipboard, parseEmailContent } from "../../helpers/formatters";
import ChatBlockEditModal from "./ChatBlockEditModal";

export default function ChatEmailBlock({ content = "", title = "Email / Outreach Template" }) {
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { subject, body } = parseEmailContent(content);

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-zinc-200 bg-zinc-50/90 shadow-xs overflow-hidden">
      {/* Top Header with Copy & Edit Buttons */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-zinc-200/80">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black transition-colors shadow-2xs"
          >
            <svg className="h-3 w-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <span className="text-emerald-400 font-bold">✓ Copied!</span>
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3 text-xs text-zinc-900 leading-relaxed">
        {subject && (
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Subject Line:
            </span>
            <span className="font-semibold text-zinc-900 select-all">{subject}</span>
          </div>
        )}

        <div className="whitespace-pre-line leading-relaxed text-zinc-800 select-text">
          {body}
        </div>
      </div>

      {/* Edit Modal */}
      <ChatBlockEditModal
        isOpen={isEditOpen}
        initialText={content}
        title={`Customize ${title}`}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
}
