import { CLIENT_COPY } from "../../../common/api/apiError";
import {
  AI_LIMITS,
  BUSY_WAIT_SECONDS,
  DEFAULT_AI_MODE,
  RATE_LIMIT_FALLBACK_SECONDS,
  RATE_LIMIT_MAX_SECONDS,
  isAiMode,
} from "../config/aiConfig";
import { stripAiErrorPrefix } from "../utils/sseParser";

export function asText(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function asOptionalText(value) {
  const text = asText(value).trim();
  return text || null;
}

export function asPositiveInt(value) {
  const id = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function clampRetryAfter(value, fallback = RATE_LIMIT_FALLBACK_SECONDS) {
  const seconds = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(seconds) || seconds < 0) return fallback;
  return Math.min(RATE_LIMIT_MAX_SECONDS, Math.max(1, seconds));
}

export function validatePrompt(prompt) {
  const text = asText(prompt);
  if (!text.trim()) return "Enter a message before sending.";
  if (text.length > AI_LIMITS.PROMPT_MAX) {
    return `Messages can be at most ${AI_LIMITS.PROMPT_MAX} characters.`;
  }
  return null;
}

export function validatePaste(value, label) {
  const text = asText(value);
  if (text.length > AI_LIMITS.PASTE_MAX) {
    return `${label} can be at most ${AI_LIMITS.PASTE_MAX} characters.`;
  }
  return null;
}

export function validateTemperature(value) {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < AI_LIMITS.TEMPERATURE_MIN || n > AI_LIMITS.TEMPERATURE_MAX) {
    return "Temperature must be between 0.0 and 2.0.";
  }
  return null;
}

export function normalizeMode(mode) {
  return isAiMode(mode) ? mode : DEFAULT_AI_MODE;
}

export function buildChatRequest({
  prompt,
  mode,
  customResumeText,
  jobDescription,
  jobId,
  resumeId,
  temperature,
}) {
  const body = {
    prompt: asText(prompt),
    mode: normalizeMode(mode),
  };

  const resume = asOptionalText(customResumeText);
  if (resume) body.customResumeText = resume;

  const ownedResumeId = asPositiveInt(resumeId);
  if (!resume && ownedResumeId) body.resumeId = ownedResumeId;

  const jobText = asOptionalText(jobDescription);
  if (jobText) body.jobDescription = jobText;

  const ownedJobId = asPositiveInt(jobId);
  if (!jobText && ownedJobId) body.jobId = ownedJobId;

  if (typeof temperature === "number" && Number.isFinite(temperature)) {
    body.temperature = temperature;
  }

  return body;
}

export function mapChatResponse(payload) {
  const data =
    payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "content")
      ? payload
      : payload?.data && typeof payload.data === "object"
        ? payload.data
        : {};

  const tokens = (value) => {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  return {
    content: asText(data.content),
    model: asOptionalText(data.model),
    finishReason: asOptionalText(data.finishReason),
    mode: normalizeMode(data.mode),
    promptTokens: tokens(data.promptTokens),
    completionTokens: tokens(data.completionTokens),
    totalTokens: tokens(data.totalTokens),
    timestamp: asOptionalText(data.timestamp),
  };
}

export function mapHealthMetadata(payload) {
  const data =
    payload && typeof payload === "object" && (payload.activeModel || payload.status || payload.healthCheckType)
      ? payload
      : payload?.data && typeof payload.data === "object"
        ? payload.data
        : {};

  return {
    status: asOptionalText(data.status),
    healthCheckType: asOptionalText(data.healthCheckType) || "configuration",
    activeModel: asOptionalText(data.activeModel),
    streamingSupported: data.streamingSupported !== false,
    timestamp: asOptionalText(data.timestamp),
  };
}

export function mapSavedJobOptions(payload) {
  const page =
    payload && typeof payload === "object" && Array.isArray(payload.content)
      ? payload
      : payload?.data && Array.isArray(payload.data.content)
        ? payload.data
        : { content: Array.isArray(payload) ? payload : [] };

  return (page.content || [])
    .map((job) => {
      const id = asPositiveInt(job?.id);
      if (!id) return null;
      const title = asOptionalText(job.title);
      const company = asOptionalText(job.company);
      return {
        id,
        title: title || "Untitled role",
        company: company || "",
        label: [title || "Untitled role", company].filter(Boolean).join(" · "),
      };
    })
    .filter(Boolean);
}

export function mapResumeContextResult(err) {
  if (!err) {
    return { status: "ready", message: null, retryAfter: null };
  }

  const status = typeof err.status === "number" ? err.status : 0;
  const message = asOptionalText(err.message);

  if (status === 404) {
    return {
      status: "missing",
      message: message || "No high-priority resume is ready to preview.",
      retryAfter: null,
    };
  }
  if (status === 409) {
    return {
      status: "pending",
      message: message || "Your resume is still being processed. Please try again in a few moments.",
      retryAfter: null,
    };
  }
  if (status === 422) {
    return {
      status: "failed",
      message: message || "Your resume could not be parsed. Re-upload a PDF from Profile.",
      retryAfter: null,
    };
  }
  if (status === 429) {
    return {
      status: "rateLimited",
      message: message || "Too many requests. Please try again later.",
      retryAfter: clampRetryAfter(err.retryAfter),
    };
  }
  if (status === 401) {
    return {
      status: "error",
      message: CLIENT_COPY.unauthorized,
      retryAfter: null,
    };
  }

  return {
    status: "error",
    message: message || CLIENT_COPY.generic,
    retryAfter: null,
  };
}

export function mapAiError(err, { streamErrorText } = {}) {
  const status = typeof err?.status === "number" ? err.status : 0;
  const raw = stripAiErrorPrefix(asText(err?.message) || asText(streamErrorText));
  const retryAfter = err?.retryAfter == null ? null : clampRetryAfter(err.retryAfter);

  const base = {
    kind: "generic",
    message: CLIENT_COPY.generic,
    canRetry: true,
    profileLink: false,
    retryAfter: null,
  };

  if (status === 0) {
    return { ...base, kind: "network", message: CLIENT_COPY.network };
  }

  if (status === 400) {
    if (/blank|prompt/i.test(raw)) {
      return { ...base, kind: "validation", message: "Enter a message before sending.", canRetry: false };
    }
    if (/malformed|mode/i.test(raw)) {
      return { ...base, kind: "validation", message: "That request could not be read. Check the mode and try again.", canRetry: false };
    }
    if (/temperature/i.test(raw)) {
      return { ...base, kind: "validation", message: "Temperature must be between 0.0 and 2.0.", canRetry: false };
    }
    return { ...base, kind: "validation", message: raw || "This message could not be sent.", canRetry: false };
  }

  if (status === 401) {
    return { ...base, kind: "auth", message: CLIENT_COPY.unauthorized, canRetry: false };
  }

  if (status === 404) {
    if (/resume/i.test(raw)) {
      return { ...base, kind: "resumeMissing", message: raw || "Resume not found.", canRetry: false, profileLink: true };
    }
    if (/profile/i.test(raw)) {
      return { ...base, kind: "profileMissing", message: raw || "User profile not found.", canRetry: false, profileLink: true };
    }
    return { ...base, kind: "jobMissing", message: raw || "Job not found.", canRetry: false };
  }

  if (status === 408) {
    return {
      ...base,
      kind: "timeout",
      message: raw || "The request timed out. Try a shorter prompt.",
    };
  }

  if (status === 409) {
    return {
      ...base,
      kind: "resumePending",
      message: raw || "Your resume is still being processed. Please try again in a few moments.",
    };
  }

  if (status === 422) {
    return {
      ...base,
      kind: "resumeFailed",
      message: raw || "Your resume could not be parsed. Re-upload a PDF from Profile.",
      canRetry: false,
      profileLink: true,
    };
  }

  if (status === 429) {
    return {
      ...base,
      kind: "rateLimit",
      message: "Too many requests. Please try again later.",
      retryAfter: retryAfter ?? RATE_LIMIT_FALLBACK_SECONDS,
    };
  }

  if (status === 499) {
    return { ...base, kind: "cancelled", message: "Generation stopped.", canRetry: false };
  }

  if (status === 502) {
    return {
      ...base,
      kind: "provider",
      message: raw || "The AI service could not complete that reply. Please try again.",
    };
  }

  if (status === 503) {
    const busy = /busy/i.test(raw);
    return {
      ...base,
      kind: busy ? "busy" : "unavailable",
      message: raw || "The AI service is temporarily unavailable. Please try again shortly.",
      retryAfter: retryAfter ?? BUSY_WAIT_SECONDS,
    };
  }

  if (status === 500) {
    return { ...base, kind: "generic", message: CLIENT_COPY.generic };
  }

  if (raw) return { ...base, message: raw };
  return base;
}
