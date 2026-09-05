import { useEffect, useId, useState } from "react";
import { copyToClipboard, wordCount } from "../../utils/formatters";
import { CloseIcon } from "../common/AiIcons";

export default function AiBlockEditModal({ isOpen, initialText, title = "Edit generated content", onClose }) {
  const [text, setText] = useState(initialText || "");
  const [source, setSource] = useState(initialText || "");
  const [copied, setCopied] = useState(false);
  const titleId = useId();
  const fieldId = useId();

  if ((initialText || "") !== source) {
    setSource(initialText || "");
    setText(initialText || "");
  }

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-2xl bg-bg rounded-2xl border border-line shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <h3 id={titleId} className="text-xs font-bold text-ink">
            {title}
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-muted hover:text-ink" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="p-5 flex-1 flex flex-col overflow-hidden">
          <label htmlFor={fieldId} className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">
            Edit text, then copy
          </label>
          <textarea
            id={fieldId}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={14}
            className="ai-scroll w-full flex-1 p-3.5 rounded-xl bg-field border border-line text-xs leading-relaxed text-ink resize-none"
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-line">
          <span className="text-[11px] text-muted">
            {text.length} characters · {wordCount(text)} words
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-9 px-3.5 rounded-xl border border-line text-xs font-semibold">
              Cancel
            </button>
            <button type="button" onClick={handleCopy} className="h-9 px-4 rounded-xl bg-ink text-white text-xs font-semibold">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
