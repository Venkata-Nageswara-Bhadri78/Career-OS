const unset = async () => {
  throw new Error("Session bridge is not registered.");
};

let bridge = {
  getAuthorizationHeader: () => null,
  refreshSession: unset,
  endSession: () => {},
  isPublicEndpoint: () => false,
};

export function registerSessionBridge(nextBridge) {
  if (!nextBridge || typeof nextBridge !== "object") return;
  bridge = {
    getAuthorizationHeader:
      typeof nextBridge.getAuthorizationHeader === "function"
        ? nextBridge.getAuthorizationHeader
        : bridge.getAuthorizationHeader,
    refreshSession:
      typeof nextBridge.refreshSession === "function" ? nextBridge.refreshSession : bridge.refreshSession,
    endSession: typeof nextBridge.endSession === "function" ? nextBridge.endSession : bridge.endSession,
    isPublicEndpoint:
      typeof nextBridge.isPublicEndpoint === "function" ? nextBridge.isPublicEndpoint : bridge.isPublicEndpoint,
  };
}

export function getAuthorizationHeader() {
  try {
    return bridge.getAuthorizationHeader() || null;
  } catch {
    return null;
  }
}

export function isPublicEndpoint(endpoint) {
  try {
    return Boolean(bridge.isPublicEndpoint(endpoint));
  } catch {
    return false;
  }
}

export async function refreshSession() {
  return bridge.refreshSession();
}

export function endSession(options) {
  try {
    bridge.endSession(options);
  } catch {
    /* session teardown must never throw into UI */
  }
}
