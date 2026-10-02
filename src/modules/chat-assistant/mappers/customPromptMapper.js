import { CLIENT_COPY } from "../../../common/api/apiError";
import { CUSTOM_PROMPT_COPY, CUSTOM_PROMPT_LIMITS } from "../config/customPromptConfig";

function asPositiveInt(value) {
  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) && asNumber > 0 ? asNumber : null;
  }
  const id = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function asText(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asOptionalTimestamp(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

export function mapCustomPrompt(item) {
  const id = asPositiveInt(item?.id);
  const title = asText(item?.title);
  const prompt = asText(item?.prompt);
  if (!id || !title) return null;
  return {
    id,
    title,
    prompt,
    createdAt: asOptionalTimestamp(item?.createdAt),
    updatedAt: asOptionalTimestamp(item?.updatedAt),
  };
}

export function mapCustomPromptList(payload) {
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map(mapCustomPrompt).filter(Boolean);
}

export function toCustomPromptRequest(title, prompt) {
  return {
    title: asText(title).trim(),
    prompt: asText(prompt).trim(),
  };
}

export function validateCustomPromptFields(title, prompt) {
  const titleValue = asText(title);
  const promptValue = asText(prompt);
  const errors = {};

  if (!titleValue.trim()) errors.title = CUSTOM_PROMPT_COPY.TITLE_BLANK;
  else if (titleValue.length > CUSTOM_PROMPT_LIMITS.TITLE_MAX) errors.title = CUSTOM_PROMPT_COPY.TITLE_MAX;

  if (!promptValue.trim()) errors.prompt = CUSTOM_PROMPT_COPY.PROMPT_BLANK;
  else if (promptValue.length > CUSTOM_PROMPT_LIMITS.PROMPT_MAX) errors.prompt = CUSTOM_PROMPT_COPY.PROMPT_MAX;

  return errors;
}

export function sortCustomPrompts(rows) {
  return [...rows].sort((left, right) => {
    const leftStamp = left?.updatedAt || left?.createdAt || "";
    const rightStamp = right?.updatedAt || right?.createdAt || "";
    if (leftStamp !== rightStamp) return rightStamp.localeCompare(leftStamp);
    return (right?.id || 0) - (left?.id || 0);
  });
}

export function upsertCustomPrompt(rows, item) {
  if (!item?.id) return rows;
  return sortCustomPrompts([item, ...rows.filter((row) => row.id !== item.id)]);
}

export function mapCustomPromptError(err) {
  const status = typeof err?.status === "number" ? err.status : 0;
  const raw = typeof err?.message === "string" ? err.message.trim() : "";

  if (status === 0) return { status, message: CLIENT_COPY.network, stale: false };
  if (status === 400) return { status, message: raw || "Check the title and prompt, then try again.", stale: false };
  if (status === 401) return { status, message: CLIENT_COPY.unauthorized, stale: false };
  if (status === 403) {
    return { status, message: raw || "This client is not authorized to access this resource.", stale: false };
  }
  if (status === 404) return { status, message: raw || CUSTOM_PROMPT_COPY.NOT_FOUND, stale: true };
  if (status === 408) return { status, message: CLIENT_COPY.timeout, stale: false };
  if (status === 499) return { status, message: CLIENT_COPY.cancelled, stale: false };
  return { status, message: raw || CLIENT_COPY.generic, stale: false };
}

export function formatPromptUpdatedAt(value) {
  if (!value) return "";
  const raw = typeof value === "string" ? value.trim() : "";
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return "";
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0),
    Number(match[6] ?? 0)
  );
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
