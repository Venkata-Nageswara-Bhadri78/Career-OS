import { useState } from "react";
import { copyToClipboard, parseEmailContent } from "../../utils/formatters";
import { CopyIcon } from "../common/AiIcons";
import AiBlockEditModal from "./AiBlockEditModal";

export default function AiEmailBlock({ content = "", title = "Email / outreach" }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const { subject, body } = parseEmailContent(content);

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-line bg-field overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-line">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-[11px] font-bold text-ink uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="h-7 px-2.5 text-[11px] font-medium rounded-lg border border-line bg-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="h-7 px-2.5 text-[11px] font-medium rounded-lg bg-ink text-white inline-flex items-center gap-1"
          >
            <CopyIcon className="h-3 w-3" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3 text-xs text-ink leading-relaxed">
        {subject ? (
          <div className="p-2.5 rounded-xl bg-white border border-line">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-0.5">Subject</span>
            <span className="font-semibold">{subject}</span>
          </div>
        ) : null}
        <div className="whitespace-pre-line">{body}</div>
      </div>
      <AiBlockEditModal isOpen={editing} initialText={content} title={`Customize ${title}`} onClose={() => setEditing(false)} />
    </div>
  );
}
