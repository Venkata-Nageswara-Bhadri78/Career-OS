/**
 * Community timestamps are server `LocalDateTime` values with no zone offset
 * (`yyyy-MM-ddTHH:mm:ss`). The API writes `LocalDateTime.now()` and does not
 * configure a JVM timezone, so the digits are the server's wall clock.
 *
 * This file is the only place those strings are parsed. Calendar fields are
 * read directly and shown as that same clock, matching chat history's
 * `parseServerDateTime`. `new Date(string)` is not used: an offset-less
 * string is not a UTC instant, and the engine's guess is not the contract.
 *
 * Message order stays the server's order. Parsed dates are for display only.
 */

const SERVER_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/;

export function parseServerTimestamp(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(SERVER_TIMESTAMP);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0),
    Number(match[6] ?? 0)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCommunityTimestamp(value) {
  const date = value instanceof Date && !Number.isNaN(value.getTime()) ? value : parseServerTimestamp(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatCommunityDate(value) {
  const date = value instanceof Date && !Number.isNaN(value.getTime()) ? value : parseServerTimestamp(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatCommunityClock(value) {
  const date = value instanceof Date && !Number.isNaN(value.getTime()) ? value : parseServerTimestamp(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Calendar key from a real createdAt. Null when the string cannot be parsed. */
export function communityDateKey(value) {
  const date = parseServerTimestamp(value);
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
