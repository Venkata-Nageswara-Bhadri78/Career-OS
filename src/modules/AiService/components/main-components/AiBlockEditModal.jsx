import { useState, useEffect } from "react";
import { copyToClipboard } from "../../helpers/aiFormatters";

export default function AiBlockEditModal({ isOpen, initialText, title = "Edit Generated Content", onClose }) {
  const [text, setText] = useState(initialText || "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(initialText || "");
  }, [initialText]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-black" />
            <h3 className="text-xs font-bold text-zinc-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Edit Body */}
        <div className="p-5 flex-1 flex flex-col overflow-hidden">
          <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
            Edit text below to tailor to your needs:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full flex-1 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black focus:outline-none transition-all text-xs font-sans leading-relaxed text-zinc-900 resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100 bg-zinc-50/70">
          <span className="text-[11px] text-zinc-400">
            {text.length} characters • {text.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 transition-all shadow-xs"
            >
              {copied ? (
                <>
                  <span className="text-emerald-300 font-bold">✓ Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Customized Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
