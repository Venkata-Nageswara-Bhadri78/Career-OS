import { useEffect, useState } from "react";
import { copyToClipboard } from "../../utils/formatters";
import { ChatIconButton, CheckIcon, CopyIcon, DownloadIcon, ResetIcon } from "../common/ChatIcons";

export default function ChatBlockEditModal({
  isOpen,
  initialText,
  title = "Edit content",
  onClose,
  onDownload,
}) {
  const source = initialText || "";
  const [draftSource, setDraftSource] = useState(source);
  const [text, setText] = useState(source);
  const [copied, setCopied] = useState(false);

  if (source !== draftSource) {
    setDraftSource(source);
    setText(source);
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

  const selectAll = (event) => {
    event.target.select();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-edit-title"
        className="relative w-full max-w-2xl bg-bg rounded-2xl shadow-2xl border border-line overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-field/70">
          <h3 id="chat-edit-title" className="text-xs font-bold text-ink">
            {title}
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-muted hover:text-ink" aria-label="Close editor">
            ✕
          </button>
        </div>

        <div className="p-5 flex-1 flex flex-col min-h-0">
          <label htmlFor="chat-edit-text" className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">
            Edit locally — this does not change the saved chat
          </label>
          <textarea
            id="chat-edit-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onFocus={selectAll}
            rows={14}
            className="chat-assistant-scroll w-full flex-1 p-3.5 rounded-xl bg-field border border-line focus:outline-none text-xs font-mono leading-relaxed text-ink"
          />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-line bg-field/70 gap-2">
          <span className="text-[11px] text-muted">
            {text.length} characters
          </span>
          <div className="flex items-center gap-0.5">
            <ChatIconButton label="Reset" className="h-8 w-8" onClick={() => setText(initialText || "")}>
              <ResetIcon />
            </ChatIconButton>
            {onDownload ? (
              <ChatIconButton label="Download" className="h-8 w-8" onClick={() => onDownload(text)}>
                <DownloadIcon />
              </ChatIconButton>
            ) : null}
            <ChatIconButton label="Close" className="h-8 w-8" onClick={onClose}>
              <span className="text-sm leading-none">✕</span>
            </ChatIconButton>
            <ChatIconButton label={copied ? "Copied" : "Copy"} className="h-8 w-8" onClick={handleCopy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </ChatIconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
