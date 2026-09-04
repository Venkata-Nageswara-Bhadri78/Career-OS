import { memo, useEffect, useRef, useState } from "react";
import { COLLAPSE_RESPONSE_CHARS, SELECTION_ACTIONS } from "../../config/chatAssistantConfig";
import { copyToClipboard, formatChatTime } from "../../utils/formatters";
import {
  ChatIconButton,
  CheckIcon,
  CopyIcon,
  EditIcon,
  GoodIcon,
  PoorIcon,
  ReportIcon,
  ResendIcon,
  RetryIcon,
} from "../common/ChatIcons";
import ChatMarkdownRenderer from "../renderers/ChatMarkdownRenderer";

function CopyButton({ text, tone = "default" }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const onCopy = async () => {
    const ok = await copyToClipboard(text);
    setCopied(ok);
    setFailed(!ok);
    window.setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 1600);
  };

  return (
    <ChatIconButton
      label={failed ? "Copy failed" : copied ? "Copied" : "Copy"}
      onClick={onCopy}
      tone={tone}
      className="h-7 w-7"
    >
      {copied || failed ? <CheckIcon /> : <CopyIcon />}
    </ChatIconButton>
  );
}

function UserMessage({ turn, pending, onEdit, onResubmit, disabled }) {
  return (
    <article className="group flex w-full flex-col items-end gap-1 px-1 py-3">
      <div className="relative flex max-w-[85%] flex-col items-end">
        <div className="bg-field px-5 py-3.5 rounded-3xl rounded-tr-sm text-ink text-[15px] leading-relaxed whitespace-pre-wrap break-words shadow-xs">
          {turn.userPrompt}
        </div>
        <div className="mt-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <CopyButton text={turn.userPrompt} />
          <ChatIconButton
            label="Edit prompt"
            disabled={disabled}
            onClick={() => onEdit?.(turn.userPrompt)}
            className="h-7 w-7"
          >
            <EditIcon />
          </ChatIconButton>
          <ChatIconButton
            label="Resend prompt"
            disabled={disabled}
            onClick={() => onResubmit?.(turn.userPrompt)}
            className="h-7 w-7"
          >
            <ResendIcon />
          </ChatIconButton>
        </div>
      </div>
      <p className="text-[10px] text-muted px-1">
        {pending ? "Sending…" : formatChatTime(turn.createdAt)}
      </p>
    </article>
  );
}

function AssistantMessage({
  turn,
  onRetry,
  onComingSoon,
  onUseSelection,
  disabled,
}) {
  const bodyRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [selectionMenu, setSelectionMenu] = useState(null);
  const long = (turn.aiResponse || "").length > COLLAPSE_RESPONSE_CHARS;
  const shown = !long || expanded ? turn.aiResponse : `${turn.aiResponse.slice(0, COLLAPSE_RESPONSE_CHARS)}…`;

  useEffect(() => {
    const node = bodyRef.current;
    if (!node) return undefined;
    const onMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || !node.contains(selection.anchorNode)) {
        setSelectionMenu(null);
        return;
      }
      const range = selection.getRangeAt(0).getBoundingClientRect();
      const parent = node.getBoundingClientRect();
      setSelectionMenu({
        text,
        top: range.top - parent.top - 40,
        left: Math.min(Math.max(8, range.left - parent.left), parent.width - 220),
      });
    };
    node.addEventListener("mouseup", onMouseUp);
    return () => node.removeEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <article className="group flex w-full gap-3 px-1 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white mt-1" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8V4H8" />
          <rect x="4" y="8" width="16" height="12" rx="2" />
        </svg>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden min-w-0 pt-1">
        <div ref={bodyRef} className="relative">
          {selectionMenu ? (
            <div
              className="absolute z-10 flex flex-wrap gap-1 rounded-lg border border-line bg-bg p-1 shadow-md"
              style={{ top: selectionMenu.top, left: selectionMenu.left }}
            >
              {SELECTION_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="px-2 py-1 text-[11px] font-semibold rounded-md hover:bg-field"
                  onClick={() => {
                    onUseSelection?.(`${action.prefix}${selectionMenu.text}`);
                    setSelectionMenu(null);
                    window.getSelection()?.removeAllRanges();
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
          <ChatMarkdownRenderer content={shown} />
        </div>
        {long ? (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="text-[11px] font-semibold text-muted hover:text-ink"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        ) : null}
        <div className="pt-1 flex flex-wrap items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <CopyButton text={turn.aiResponse} />
          <ChatIconButton
            label="Retry this reply"
            disabled={disabled}
            onClick={() => onRetry?.(turn.userPrompt)}
            className="h-7 w-7"
          >
            <RetryIcon />
          </ChatIconButton>
          <ChatIconButton label="Good response" onClick={onComingSoon} className="h-7 w-7">
            <GoodIcon />
          </ChatIconButton>
          <ChatIconButton label="Poor response" onClick={onComingSoon} className="h-7 w-7">
            <PoorIcon />
          </ChatIconButton>
          <ChatIconButton label="Report response" onClick={onComingSoon} className="h-7 w-7">
            <ReportIcon />
          </ChatIconButton>
          <span className="text-[10px] text-muted px-2">{formatChatTime(turn.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}

function ChatMessage({
  turn,
  pending = false,
  onEdit,
  onResubmit,
  onRetry,
  onComingSoon,
  onUseSelection,
  disabled,
}) {
  if (pending || !turn.aiResponse) {
    return <UserMessage turn={turn} pending={pending} onEdit={onEdit} onResubmit={onResubmit} disabled={disabled} />;
  }

  return (
    <>
      <UserMessage turn={turn} onEdit={onEdit} onResubmit={onResubmit} disabled={disabled} />
      <AssistantMessage
        turn={turn}
        onRetry={onRetry}
        onComingSoon={onComingSoon}
        onUseSelection={onUseSelection}
        disabled={disabled}
      />
    </>
  );
}

export default memo(ChatMessage);
