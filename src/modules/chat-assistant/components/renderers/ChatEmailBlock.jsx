import { useState } from "react";
import { copyToClipboard, parseEmailContent } from "../../utils/formatters";
import { ChatIconButton, CheckIcon, CopyIcon, EditIcon } from "../common/ChatIcons";
import ChatBlockEditModal from "./ChatBlockEditModal";

export default function ChatEmailBlock({ content = "", title = "Email / Outreach template" }) {
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { subject, body } = parseEmailContent(content);

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-line bg-field/80 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg border-b border-line">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-[11px] font-bold text-ink uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <ChatIconButton label="Edit" className="h-7 w-7" onClick={() => setIsEditOpen(true)}>
            <EditIcon />
          </ChatIconButton>
          <ChatIconButton label={copied ? "Copied" : "Copy"} className="h-7 w-7" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </ChatIconButton>
        </div>
      </div>

      <div className="p-4 space-y-3 text-xs text-ink leading-relaxed">
        {subject ? (
          <div className="p-2.5 rounded-xl bg-bg border border-line">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-0.5">Subject</span>
            <span className="font-semibold select-all">{subject}</span>
          </div>
        ) : null}
        <div className="whitespace-pre-line leading-relaxed select-text">{body}</div>
      </div>

      <ChatBlockEditModal
        isOpen={isEditOpen}
        initialText={content}
        title={`Customize ${title}`}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
}
