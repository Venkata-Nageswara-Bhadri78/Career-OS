import { CLIENT_COPY } from "../../../common/api/apiError";
import { CHAT_ASSISTANT_LIMITS, RETRY_AFTER_FALLBACK_SECONDS, RETRY_AFTER_MAX_SECONDS } from "../config/chatAssistantConfig";

function asPositiveInt(value) {
  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) && asNumber > 0 ? asNumber : null;
  }
  const id = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function asNonNegativeInt(value, fallback = 0) {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

function asText(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asOptionalText(value) {
  const text = asText(value).trim();
  return text || null;
}

function asTitle(item) {
  const chatTitle = asText(item?.chatTitle).trim();
  if (chatTitle) return chatTitle;
  const company = asText(item?.company).trim();
  const jobTitle = asText(item?.jobTitle).trim();
  const combined = [company, jobTitle].filter(Boolean).join(" - ");
  return combined || "Untitled chat";
}

export function clampRetryAfter(value) {
  const seconds = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(seconds) || seconds < 0) return RETRY_AFTER_FALLBACK_SECONDS;
  return Math.min(RETRY_AFTER_MAX_SECONDS, Math.max(1, seconds));
}

export function isValidJobId(jobId) {
  return Number.isInteger(jobId) && jobId > 0;
}

export function isBlankPrompt(prompt) {
  return !asText(prompt).trim();
}

export function isOversizedPrompt(prompt) {
  return asText(prompt).length > CHAT_ASSISTANT_LIMITS.PROMPT_MAX;
}

export function validatePrompt(prompt) {
  if (isBlankPrompt(prompt)) return "Enter a message before sending.";
  if (isOversizedPrompt(prompt)) return `Messages can be at most ${CHAT_ASSISTANT_LIMITS.PROMPT_MAX} characters.`;
  return null;
}

export function mapChatSummary(item) {
  const jobId = asPositiveInt(item?.jobId);
  if (!jobId) return null;
  return {
    jobId,
    chatSessionId: asPositiveInt(item?.chatSessionId),
    title: asTitle(item),
    jobTitle: asOptionalText(item?.jobTitle),
    company: asOptionalText(item?.company),
    updatedAt: typeof item?.updatedAt === "string" ? item.updatedAt : null,
  };
}

export function mapChatList(payload) {
  const data = payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "chats")
    ? payload
    : payload?.data;
  const rows = Array.isArray(data?.chats) ? data.chats : Array.isArray(data) ? data : Array.isArray(payload) ? payload : [];
  const chats = rows.map(mapChatSummary).filter(Boolean);
  return {
    chats,
    page: asNonNegativeInt(data?.page),
    size: asNonNegativeInt(data?.size, CHAT_ASSISTANT_LIMITS.PAGE_SIZE),
    totalElements: asNonNegativeInt(data?.totalElements, chats.length),
    totalPages: Math.max(1, asNonNegativeInt(data?.totalPages, 1)),
  };
}

export function mapChatMessage(item) {
  const id = asPositiveInt(item?.id);
  const turnNumber = asPositiveInt(item?.turnNumber);
  if (!id || !turnNumber) return null;
  return {
    id,
    turnNumber,
    userPrompt: asText(item?.userPrompt),
    aiResponse: asText(item?.aiResponse),
    createdAt: typeof item?.createdAt === "string" ? item.createdAt : null,
  };
}

function sortTurns(messages) {
  return [...messages].sort((a, b) => a.turnNumber - b.turnNumber || a.id - b.id);
}

export function mergeTurns(existing, incoming) {
  const byId = new Map();
  [...existing, ...incoming].forEach((turn) => {
    if (!turn?.id) return;
    byId.set(turn.id, turn);
  });
  return sortTurns([...byId.values()]);
}

export function mapChatHistory(payload, fallbackJobId = null) {
  const data = payload && typeof payload === "object" && Array.isArray(payload.messages)
    ? payload
    : payload?.data && typeof payload.data === "object"
      ? payload.data
      : {};
  const messages = Array.isArray(data.messages) ? data.messages.map(mapChatMessage).filter(Boolean) : [];
  return {
    chatSessionId: asPositiveInt(data.chatSessionId),
    jobId: asPositiveInt(data.jobId) ?? fallbackJobId,
    chatTitle: asOptionalText(data.chatTitle),
    messages: sortTurns(messages),
    page: asNonNegativeInt(data.page),
    size: asNonNegativeInt(data.size, CHAT_ASSISTANT_LIMITS.PAGE_SIZE),
    totalElements: asNonNegativeInt(data.totalElements, messages.length),
    totalPages: asNonNegativeInt(data.totalPages),
  };
}

export function mapSendResult(payload) {
  const data = payload && typeof payload === "object" && payload.latestTurn
    ? payload
    : payload?.data && typeof payload.data === "object"
      ? payload.data
      : {};
  const latestTurn = mapChatMessage(data.latestTurn);
  if (!latestTurn) return null;
  return {
    chatSessionId: asPositiveInt(data.chatSessionId),
    chatTitle: asOptionalText(data.chatTitle),
    latestTurn,
  };
}

export function findTurnByPrompt(messages, prompt) {
  const expected = asText(prompt);
  if (!expected) return null;
  const rows = Array.isArray(messages) ? messages : [];
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    if (rows[i]?.userPrompt === expected) return rows[i];
  }
  return null;
}

function isResumePendingMessage(message) {
  return /resume/i.test(message) && /process/i.test(message);
}

export function mapChatError(err) {
  const status = typeof err?.status === "number" ? err.status : 0;
  const raw = typeof err?.message === "string" ? err.message.trim() : "";
  const retryAfter = err?.retryAfter == null ? null : clampRetryAfter(err.retryAfter);

  const base = {
    kind: "generic",
    message: CLIENT_COPY.generic,
    canRetry: true,
    uncertain: false,
    reconcile: false,
    profileLink: false,
    retryAfter: null,
  };

  if (status === 0) {
    return { ...base, kind: "network", message: CLIENT_COPY.network, uncertain: true, reconcile: true };
  }

  if (status === 400) {
    if (/prior turns/i.test(raw)) {
      return {
        ...base,
        kind: "turnLimit",
        message: "This conversation has reached the turn limit. Clear it to continue.",
        canRetry: false,
      };
    }
    if (/blank|prompt/i.test(raw)) {
      return { ...base, kind: "validation", message: "Enter a message before sending.", canRetry: false };
    }
    if (/size|page/i.test(raw)) {
      return { ...base, kind: "validation", message: "Could not load that page of the conversation.", canRetry: true };
    }
    return { ...base, kind: "validation", message: "This message could not be sent. Check the text and try again.", canRetry: false };
  }

  if (status === 401) {
    return { ...base, kind: "auth", message: CLIENT_COPY.unauthorized, canRetry: false };
  }

  if (status === 404) {
    return { ...base, kind: "notFound", message: "Job not found.", canRetry: false };
  }

  if (status === 408) {
    return {
      ...base,
      kind: "timeout",
      message: "The assistant is taking longer than expected. Checking whether the reply was saved…",
      uncertain: true,
      reconcile: true,
    };
  }

  if (status === 409) {
    if (isResumePendingMessage(raw)) {
      return {
        ...base,
        kind: "resumePending",
        message: "Your resume is still being processed. Try again in a moment.",
        canRetry: true,
      };
    }
    return {
      ...base,
      kind: "conflict",
      message: "This chat was updated at the same time. Please retry.",
      canRetry: true,
      reconcile: true,
    };
  }

  if (status === 422) {
    return {
      ...base,
      kind: "resumeFailed",
      message: "Your resume could not be read. Repair or re-upload it, then try again.",
      canRetry: false,
      profileLink: true,
    };
  }

  if (status === 429) {
    return {
      ...base,
      kind: "rateLimit",
      message: "Sending is paused while the rate limit resets.",
      retryAfter: retryAfter ?? RETRY_AFTER_FALLBACK_SECONDS,
      canRetry: true,
    };
  }

  if (status === 499) {
    return { ...base, kind: "cancelled", message: "Stopped waiting for a reply.", canRetry: true, reconcile: true };
  }

  if (status === 502) {
    return {
      ...base,
      kind: "aiFailed",
      message: "The assistant could not complete that reply. Your draft is still here.",
      canRetry: true,
    };
  }

  if (status === 503) {
    return {
      ...base,
      kind: "unavailable",
      message: "The assistant is busy right now. Wait a moment, then try again.",
      canRetry: true,
    };
  }

  if (status === 500) {
    return { ...base, kind: "generic", message: CLIENT_COPY.generic, canRetry: true };
  }

  return base;
}
