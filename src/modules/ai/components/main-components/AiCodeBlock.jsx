import { useState } from "react";
import { copyToClipboard } from "../../utils/formatters";
import { CopyIcon } from "../common/AiIcons";
import AiBlockEditModal from "./AiBlockEditModal";

export default function AiCodeBlock({ code = "", language = "text" }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-ink bg-ink text-white shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/10 text-[11px] gap-2">
        <span className="font-mono text-white/70 uppercase font-semibold tracking-wider truncate">{language || "code"}</span>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => setEditing(true)} className="px-2 py-0.5 rounded text-white/80 hover:bg-white/10">
            Edit
          </button>
          <button type="button" onClick={handleCopy} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white/80 hover:bg-white/10">
            <CopyIcon className="h-3 w-3" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="ai-code-pre p-4 text-xs font-mono overflow-x-auto leading-relaxed text-white/90">
        <code>{code}</code>
      </pre>
      <AiBlockEditModal isOpen={editing} initialText={code} title={`Edit ${language || "code"}`} onClose={() => setEditing(false)} />
    </div>
  );
}
