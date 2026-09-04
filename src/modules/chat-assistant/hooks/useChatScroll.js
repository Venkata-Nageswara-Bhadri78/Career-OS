import { useCallback, useEffect, useRef, useState } from "react";

export default function useChatScroll(messages, isSending, pendingPrompt) {
  const scrollRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);

  const updateStickState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    const nearBottom = distance < 96;
    stickToBottomRef.current = nearBottom;
    setShowJump(!nearBottom);
  }, []);

  const scrollToLatest = useCallback((behavior = "smooth") => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
    stickToBottomRef.current = true;
    setShowJump(false);
  }, []);

  useEffect(() => {
    if (!stickToBottomRef.current) {
      updateStickState();
      return;
    }
    scrollToLatest("auto");
  }, [messages, isSending, pendingPrompt, scrollToLatest, updateStickState]);

  return {
    scrollRef,
    showJump,
    updateStickState,
    scrollToLatest,
  };
}
