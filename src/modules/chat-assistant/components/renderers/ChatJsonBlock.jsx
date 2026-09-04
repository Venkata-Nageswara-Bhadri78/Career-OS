import { useMemo, useState } from "react";
import { copyToClipboard } from "../../utils/formatters";
import { ChatIconButton, CheckIcon, CopyIcon } from "../common/ChatIcons";

export default function ChatJsonBlock({ code = "" }) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("pretty");

  const pretty = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(code), null, 2);
    } catch {
      return null;
    }
  }, [code]);

  const shown = mode === "pretty" && pretty ? pretty : code;

  const handleCopy = async () => {
    const ok = await copyToClipboard(shown);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-ink bg-ink text-white">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/10 text-[11px]">
        <span className="font-mono text-white/70 uppercase font-semibold tracking-wider">JSON</span>
        <div className="flex items-center gap-0.5">
          {pretty ? (
            <ChatIconButton
              label={mode === "pretty" ? "Show raw JSON" : "Show formatted JSON"}
              tone="light"
              className="h-7 w-7"
              onClick={() => setMode((current) => (current === "pretty" ? "raw" : "pretty"))}
            >
              <span className="text-[10px] font-bold">{mode === "pretty" ? "{}" : "Aa"}</span>
            </ChatIconButton>
          ) : null}
          <ChatIconButton label={copied ? "Copied" : "Copy JSON"} tone="light" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </ChatIconButton>
        </div>
      </div>
      <pre className="chat-code-pre p-4 text-xs font-mono overflow-x-auto leading-relaxed text-white/90">
        <code>{shown}</code>
      </pre>
    </div>
  );
}
