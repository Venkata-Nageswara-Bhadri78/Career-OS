export const SHELL_EVENTS = Object.freeze({
  CHAT_HISTORY_CHANGED: "career-os:chat-history-changed",
});

export function emitShellEvent(name, detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function subscribeShellEvent(name, handler) {
  if (typeof window === "undefined") return () => {};
  const listener = (event) => handler(event.detail);
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
