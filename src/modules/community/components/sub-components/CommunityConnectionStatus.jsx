import { COMMUNITY_SOCKET_STATES } from "../../config/communityConstants";

export default function CommunityConnectionStatus({ state, reason }) {
  if (state === COMMUNITY_SOCKET_STATES.CONNECTED || state === COMMUNITY_SOCKET_STATES.IDLE) return null;

  let message = reason;
  if (!message) {
    if (state === COMMUNITY_SOCKET_STATES.CONNECTING) message = "Connecting…";
    else if (state === COMMUNITY_SOCKET_STATES.RECONNECTING) message = "Reconnecting…";
    else if (state === COMMUNITY_SOCKET_STATES.UNAUTHORIZED) message = "Your session has ended. Please sign in again.";
    else if (state === COMMUNITY_SOCKET_STATES.FAILED) message = "Live messaging is unavailable.";
    else message = "Disconnected.";
  }

  const alert = state === COMMUNITY_SOCKET_STATES.FAILED || state === COMMUNITY_SOCKET_STATES.UNAUTHORIZED;

  return (
    <p
      className={`mx-4 mt-3 rounded-xl border border-line px-3 py-2 text-sm ${alert ? "bg-field text-danger" : "bg-field text-muted"}`}
      role={alert ? "alert" : "status"}
      aria-live="polite"
    >
      {message}
    </p>
  );
}
