import { useEffect, useRef, useState } from "react";
import { getModeConfig } from "../../config/aiConfig";
import { buildTranscriptMarkdown, downloadTextFile } from "../../utils/formatters";
import AiComingSoonDialog from "../common/AiComingSoonDialog";
import { SparkIcon } from "../common/AiIcons";
import AiThinkingIndicator from "../loaders/AiThinkingIndicator";
import AiErrorBanner from "../sub-components/AiErrorBanner";
import AiGroundingPanel from "../sub-components/AiGroundingPanel";
import AiInputBar from "../sub-components/AiInputBar";
import AiModeTabs from "../sub-components/AiModeTabs";
import AiEmptyState from "./AiEmptyState";
import AiMessageItem from "./AiMessageItem";

export default function AiWorkspace({ grounding, chat }) {
  const [comingSoon, setComingSoon] = useState(false);
  const [dismissedError, setDismissedError] = useState(null);
  const messagesEndRef = useRef(null);
  const modeConfig = getModeConfig(grounding.mode);
  const showError = Boolean(chat.error) && dismissedError !== chat.error;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.isStreaming]);

  const jobLabel = grounding.usingPastedJob ? "pasted job description" : grounding.selectedJob?.label || null;

  const handleExport = () => {
    if (!chat.messages.length) return;
    downloadTextFile(
      "career-copilot.md",
      buildTranscriptMarkdown({
        modeLabel: modeConfig.label,
        messages: chat.messages,
      })
    );
  };

  const waitingOnEmptyAssistant =
    chat.isStreaming && chat.messages.length > 0 && !chat.messages[chat.messages.length - 1]?.content;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-bg">
      <header className="px-4 sm:px-8 md:px-12 py-3 border-b border-line flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-8 w-8 rounded-xl bg-ink text-white grid place-items-center shrink-0 ring-2 ring-accent/70">
            <SparkIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-ink truncate">Career Copilot</h1>
            <p className="text-[11px] text-muted truncate">{modeConfig.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            disabled={!chat.messages.length}
            className="h-8 px-3 rounded-xl border border-line text-[11px] font-semibold disabled:opacity-40"
          >
            Export
          </button>
          <button
            type="button"
            onClick={chat.newSession}
            className="h-8 px-3 rounded-xl bg-ink text-white text-[11px] font-semibold"
          >
            New session
          </button>
        </div>
      </header>

      <div className="py-3 shrink-0 space-y-3">
        <AiGroundingPanel grounding={grounding} disabled={chat.isStreaming} />
        <AiModeTabs selectedMode={grounding.mode} onSelectMode={grounding.setMode} disabled={chat.isStreaming} />
      </div>

      <div className="flex-1 relative min-h-0">
        <div className="ai-scroll absolute inset-0 overflow-y-auto px-4 sm:px-8 md:px-12 py-4">
          <div className="max-w-3xl mx-auto">
            {chat.messages.length === 0 ? (
              <AiEmptyState
                mode={grounding.mode}
                jobLabel={jobLabel}
                disabled={!chat.canStartRequest}
                onUseTemplate={(prompt) => chat.send(prompt)}
              />
            ) : (
              chat.messages.map((message, index) => (
                <AiMessageItem
                  key={message.id}
                  message={message}
                  isLatestStreaming={
                    chat.isStreaming &&
                    message.role === "assistant" &&
                    index === chat.messages.length - 1
                  }
                />
              ))
            )}
            {waitingOnEmptyAssistant ? <AiThinkingIndicator label={modeConfig.shortLabel} /> : null}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {showError ? (
        <AiErrorBanner
          error={chat.error}
          onRetry={chat.retryLast}
          onDismiss={() => setDismissedError(chat.error)}
        />
      ) : null}

      <AiInputBar
        value={chat.composer}
        onChange={chat.setComposer}
        onSend={chat.send}
        onStop={chat.stop}
        isStreaming={chat.isStreaming}
        disabled={chat.isStreaming || chat.isOffline}
        canSend={chat.canSend}
        retryAfter={chat.retryAfter}
        isOffline={chat.isOffline}
        resumeBlockedMessage={
          grounding.resumeBlocksSend
            ? grounding.resume.status === "pending"
              ? "Resume is still parsing. Wait, or paste resume text to send."
              : "Resume could not be parsed. Re-upload from Profile, or paste resume text."
            : null
        }
        mode={grounding.mode}
        onComingSoon={() => setComingSoon(true)}
      />

      {grounding.metadata?.activeModel ? (
        <p className="px-4 sm:px-8 md:px-12 pb-3 text-[10px] text-muted">
          Configured model: {grounding.metadata.activeModel}. This is configuration metadata, not a live provider check.
        </p>
      ) : null}

      <AiComingSoonDialog open={comingSoon} onClose={() => setComingSoon(false)} />
    </div>
  );
}
