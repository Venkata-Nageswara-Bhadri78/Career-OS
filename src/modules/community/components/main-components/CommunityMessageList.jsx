import { useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useCommunityMessageStore } from "../../hooks/communityMessagesContext";
import { isGroupedWithPrevious, isSameCommunityUser } from "../../utils/communityIdentity";
import { communityDateKey, formatCommunityDate } from "../../utils/communityTime";
import CommunityMessageBubble from "../sub-components/CommunityMessageBubble";

const LOAD_OLDER_THRESHOLD_PX = 80;
const NEAR_BOTTOM_PX = 96;

export default function CommunityMessageList() {
  const { user } = useAuth();
  const history = useCommunityMessageStore();
  const ownUserId = user?.id;
  const {
    messages,
    status,
    error,
    hasMore,
    olderStatus,
    olderError,
    loadNewest,
    loadOlder,
    paneRef,
    pendingScrollRef,
    scrollToNewest,
  } = history;
  const [showJump, setShowJump] = useState(false);
  const nearBottomRef = useRef(true);

  useLayoutEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const pending = pendingScrollRef.current;
    if (pending?.type === "preserve") {
      pane.scrollTop = pending.top + (pane.scrollHeight - pending.height);
      pendingScrollRef.current = null;
      return;
    }
    if (pending?.type === "bottom" || nearBottomRef.current) {
      pane.scrollTop = pane.scrollHeight;
      nearBottomRef.current = true;
      pendingScrollRef.current = null;
      const frame = window.requestAnimationFrame(() => setShowJump(false));
      return () => window.cancelAnimationFrame(frame);
    }
    pendingScrollRef.current = null;
    if (status === "ready" && messages.length > 0) {
      const frame = window.requestAnimationFrame(() => setShowJump(true));
      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [messages, paneRef, pendingScrollRef, status]);

  const onScroll = () => {
    const pane = paneRef.current;
    if (!pane) return;
    const distance = pane.scrollHeight - pane.scrollTop - pane.clientHeight;
    const nearBottom = distance < NEAR_BOTTOM_PX;
    nearBottomRef.current = nearBottom;
    if (nearBottom) setShowJump(false);
    if (hasMore && olderStatus !== "loading" && pane.scrollTop <= LOAD_OLDER_THRESHOLD_PX) {
      void loadOlder();
    }
  };

  let body;
  if (status === "loading") {
    body = (
      <p className="m-auto max-w-sm px-4 py-8 text-center text-sm leading-6 text-muted" role="status">
        Loading messages…
      </p>
    );
  } else if (status === "error") {
    body = (
      <div className="m-auto max-w-sm px-4 py-8 text-center" role="alert">
        <p className="text-sm leading-6 text-danger">{error || "Messages could not be loaded."}</p>
        <button
          type="button"
          onClick={() => void loadNewest()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  } else if (status === "ready" && messages.length === 0) {
    body = (
      <p className="m-auto max-w-sm px-4 py-8 text-center text-sm leading-6 text-muted">No messages yet</p>
    );
  } else {
    body = (
      <ul className="mt-auto flex w-full flex-col px-3 py-3 sm:px-4">
        {hasMore ? (
          <li className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={() => void loadOlder()}
              disabled={olderStatus === "loading"}
              aria-busy={olderStatus === "loading" || undefined}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {olderStatus === "loading" ? "Loading earlier messages…" : "Load earlier messages"}
            </button>
          </li>
        ) : null}
        {olderError ? (
          <li className="mb-3 text-center" role="alert">
            <p className="text-sm leading-6 text-danger">{olderError}</p>
            <button
              type="button"
              onClick={() => void loadOlder()}
              className="mt-2 text-sm font-semibold text-ink underline"
            >
              Retry
            </button>
          </li>
        ) : null}
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const dateKey = communityDateKey(message.createdAt);
          const previousDateKey = communityDateKey(previous?.createdAt);
          const showDate = Boolean(dateKey && dateKey !== previousDateKey);
          const dateLabel = showDate ? formatCommunityDate(message.createdAt) : "";
          const own = isSameCommunityUser(ownUserId, message.sender?.userId);
          const grouped = !showDate && isGroupedWithPrevious(message, previous);
          return (
            <li key={String(message.id)} className="min-w-0">
              {showDate && dateLabel ? (
                <p className="my-3 text-center text-[11px] font-semibold text-muted">{dateLabel}</p>
              ) : null}
              <CommunityMessageBubble message={message} own={own} grouped={grouped} />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={paneRef}
        data-community-transcript-pane
        onScroll={onScroll}
        className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-field"
      >
        {body}
      </div>
      {showJump ? (
        <button
          type="button"
          onClick={() => {
            scrollToNewest();
            nearBottomRef.current = true;
            setShowJump(false);
          }}
          className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm"
        >
          New messages
        </button>
      ) : null}
    </div>
  );
}
