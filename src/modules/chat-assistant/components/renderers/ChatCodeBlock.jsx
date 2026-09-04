import { useState } from "react";
import { LANGUAGE_EXTENSIONS } from "../../config/chatAssistantConfig";
import { copyToClipboard, downloadTextFile, extensionForLanguage } from "../../utils/formatters";
import {
  ChatIconButton,
  CheckIcon,
  CollapseIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  ExpandIcon,
} from "../common/ChatIcons";
import ChatBlockEditModal from "./ChatBlockEditModal";

export default function ChatCodeBlock({ code = "", language = "text" }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const long = code.split("\n").length > 18;

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const filename = `snippet.${extensionForLanguage(language, LANGUAGE_EXTENSIONS)}`;

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-ink bg-ink text-white shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/10 text-[11px] gap-2">
        <span className="font-mono text-white/70 uppercase font-semibold tracking-wider truncate">
          {language || "code"}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          {long ? (
            <ChatIconButton
              label={expanded ? "Collapse code" : "Expand code"}
              tone="light"
              className="h-7 w-7"
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </ChatIconButton>
          ) : null}
          <ChatIconButton label="Edit code" tone="light" className="h-7 w-7" onClick={() => setEditing(true)}>
            <EditIcon />
          </ChatIconButton>
          <ChatIconButton
            label="Download code"
            tone="light"
            className="h-7 w-7"
            onClick={() => downloadTextFile(filename, code)}
          >
            <DownloadIcon />
          </ChatIconButton>
          <ChatIconButton label={copied ? "Copied" : "Copy code"} tone="light" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </ChatIconButton>
        </div>
      </div>
      <pre className={`chat-code-pre p-4 text-xs font-mono overflow-x-auto leading-relaxed text-white/90 ${long && !expanded ? "max-h-72 overflow-y-auto" : ""}`}>
        <code>{code}</code>
      </pre>
      <ChatBlockEditModal
        isOpen={editing}
        initialText={code}
        title={`Edit ${language || "code"}`}
        onClose={() => setEditing(false)}
        onDownload={(text) => downloadTextFile(filename, text)}
      />
    </div>
  );
}
