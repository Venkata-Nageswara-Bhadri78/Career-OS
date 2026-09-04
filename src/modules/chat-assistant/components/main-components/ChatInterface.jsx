import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { APP_PATHS } from "../../../../common/config/appPaths";
import { useChatHistorySlot } from "../../../../common/components/layout/chatHistoryContext";
import { SHELL_EVENTS, emitShellEvent } from "../../../../common/utils/shellEvents";
import JobDetailsDrawer from "../../../jobs/components/main-components/JobDetailsDrawer";
import useChatAssistant from "../../hooks/useChatAssistant";
import useChatJob from "../../hooks/useChatJob";
import useChatScroll from "../../hooks/useChatScroll";
import { buildTranscriptMarkdown, downloadTextFile } from "../../utils/formatters";
import ChatComingSoonDialog from "../common/ChatComingSoonDialog";
import ChatConfirmDialog from "../common/ChatConfirmDialog";
import ChatSendingIndicator from "../loaders/ChatSendingIndicator";
import ChatSkeleton from "../skeletons/ChatSkeleton";
import ChatErrorBanner from "../sub-components/ChatErrorBanner";
import ChatFollowUps from "../sub-components/ChatFollowUps";
import ChatEmptyState from "./ChatEmptyState";
import ChatInputBar from "./ChatInputBar";
import ChatJobBanner from "./ChatJobBanner";
import ChatMessage from "./ChatMessage";

function ShortcutsDialog({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="chat-shortcuts-title" className="w-full max-w-sm rounded-2xl border border-line bg-bg p-5 shadow-2xl">
        <h2 id="chat-shortcuts-title" className="text-sm font-bold text-ink">
          Keyboard shortcuts
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li><kbd className="font-mono text-ink">/</kbd> Focus composer</li>
          <li><kbd className="font-mono text-ink">Enter</kbd> Send</li>
          <li><kbd className="font-mono text-ink">Shift + Enter</kbd> New line</li>
          <li>Stop waits for the current reply without sending again</li>
        </ul>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className="h-9 px-4 rounded-xl bg-ink text-white text-sm font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface({ jobId }) {
  const historySlot = useChatHistorySlot();
  const chat = useChatAssistant(jobId);
  const { job, isLoading: isJobLoading, setJob } = useChatJob(jobId);
  const { scrollRef, showJump, updateStickState, scrollToLatest } = useChatScroll(
    chat.messages,
    chat.isSending,
    chat.pendingPrompt
  );
  const [comingSoon, setComingSoon] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const listMatch = useMemo(
    () => (historySlot.chats || []).find((item) => item.jobId === jobId) || null,
    [historySlot.chats, jobId]
  );

  const bannerTitle = job?.title || chat.chatTitle || listMatch?.title || null;

  const handleExport = () => {
    if (!chat.messages.length) return;
    const markdown = buildTranscriptMarkdown({
      title: bannerTitle || "Job chat",
      messages: chat.messages,
    });
    downloadTextFile("job-chat.md", markdown);
  };

  if (chat.jobMissing) {
    return (
      <div className="flex-1 grid place-items-center p-8 text-center">
        <div>
          <h2 className="text-lg font-bold text-ink">Job not found</h2>
          <p className="mt-2 text-sm text-muted max-w-sm">
            This job is missing or is not in your account. The chat cannot be opened.
          </p>
          <Link to={APP_PATHS.DASHBOARD} className="mt-5 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-white">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-bg relative">
      <ChatJobBanner
        job={job}
        fallbackTitle={bannerTitle}
        fallbackCompany={listMatch?.company}
        hasJob={chat.isValidJob}
        isLoading={isJobLoading && !job}
        canClear={chat.isValidJob && !chat.isSending && chat.messages.length > 0}
        canExport={chat.messages.length > 0}
        isClearing={chat.isClearing}
        olderTurnsHiddenFromModel={chat.olderTurnsHiddenFromModel}
        onOpenDetails={() => setDetailsOpen(true)}
        onClear={() => setConfirmClear(true)}
        onExport={handleExport}
        onShortcuts={() => setShortcutsOpen(true)}
      />

      <div className="flex-1 relative min-h-0">
        {chat.historyStatus === "loading" ? (
          <ChatSkeleton />
        ) : (
          <div
            ref={scrollRef}
            onScroll={updateStickState}
            className="chat-assistant-scroll absolute inset-0 overflow-y-auto px-4 sm:px-8 md:px-12 py-6"
          >
            <div className="max-w-3xl mx-auto">
              {chat.historyStatus === "error" && chat.error && !chat.messages.length ? (
                <ChatErrorBanner error={chat.error} retryAfter={chat.retryAfter} onRetry={chat.loadHistory} />
              ) : null}

              {!chat.messages.length && !chat.pendingPrompt ? (
                <ChatEmptyState
                  hasJob={chat.isValidJob}
                  chatTitle={bannerTitle}
                  disabled={chat.isSending || !chat.isValidJob}
                  onUseTemplate={(prompt) => {
                    chat.useTemplate(prompt);
                  }}
                />
              ) : (
                <>
                  {chat.hasOlder ? (
                    <div className="flex justify-center pb-4">
                      <button
                        type="button"
                        onClick={chat.loadOlder}
                        disabled={chat.loadingOlder || chat.isSending}
                        className="h-8 px-3 rounded-full border border-line text-[11px] font-semibold disabled:opacity-50"
                      >
                        {chat.loadingOlder ? "Loading earlier turns…" : "Load earlier messages"}
                      </button>
                    </div>
                  ) : null}

                  {chat.error ? (
                    <ChatErrorBanner
                      error={chat.error}
                      retryAfter={chat.retryAfter}
                      onRetry={chat.retryLast}
                      onDismiss={chat.dismissError}
                    />
                  ) : null}

                  {chat.messages.map((turn) => (
                    <ChatMessage
                      key={turn.id}
                      turn={turn}
                      disabled={chat.isSending || chat.isClearing}
                      onEdit={chat.useTemplate}
                      onResubmit={chat.sendPrompt}
                      onRetry={chat.sendPrompt}
                      onComingSoon={() => setComingSoon(true)}
                      onUseSelection={chat.useTemplate}
                    />
                  ))}

                  {chat.pendingPrompt ? (
                    <ChatMessage
                      turn={{ id: "pending", turnNumber: 0, userPrompt: chat.pendingPrompt, aiResponse: "", createdAt: null }}
                      pending
                      disabled
                    />
                  ) : null}

                  {chat.isSending ? <ChatSendingIndicator /> : null}

                  {!chat.isSending && chat.messages.length > 0 ? (
                    <ChatFollowUps disabled={!chat.canSend} onUse={chat.sendPrompt} />
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}

        {showJump ? (
          <button
            type="button"
            onClick={() => scrollToLatest("smooth")}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 h-8 px-3 rounded-full bg-ink text-white text-[11px] font-semibold shadow-md"
          >
            Jump to latest
          </button>
        ) : null}
      </div>

      <ChatInputBar
        value={chat.composer}
        onChange={chat.updateComposer}
        onSend={chat.sendPrompt}
        onStop={chat.stopWaiting}
        isSending={chat.isSending}
        disabled={!chat.isValidJob || chat.historyStatus === "loading" || chat.isClearing}
        canSend={chat.canSend}
        retryAfter={chat.retryAfter}
        promptLimit={chat.promptLimit}
        isOffline={chat.isOffline}
        onComingSoon={() => setComingSoon(true)}
      />

      <ChatComingSoonDialog open={comingSoon} onClose={() => setComingSoon(false)} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ChatConfirmDialog
        open={confirmClear}
        title="Clear conversation"
        message="This deletes the full transcript for this job. The job itself is not removed. The next message starts a new session."
        confirmLabel="Clear"
        busy={chat.isClearing}
        onClose={() => setConfirmClear(false)}
        onConfirm={async () => {
          const ok = await chat.clearConversation();
          if (ok) setConfirmClear(false);
        }}
      />
      <JobDetailsDrawer
        isOpen={detailsOpen && chat.isValidJob}
        job={job}
        jobId={jobId}
        onClose={() => setDetailsOpen(false)}
        onJobUpdated={(updated) => {
          setJob(updated);
          emitShellEvent(SHELL_EVENTS.CHAT_HISTORY_CHANGED, { reason: "job-updated", jobId });
        }}
      />
    </div>
  );
}
