import { COMMUNITY_LIMITS } from "../config/communityConstants";

export function countCommunityCodePoints(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Array.from(text).length;
}

/**
 * Trim ends, keep internal newlines, reject blank / NUL / over-limit text.
 * Returns the trimmed text on success, or a user-facing reason on failure.
 */
export function validateCommunityMessage(text) {
  const raw = typeof text === "string" ? text : "";
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, text: null, reason: "Message text is required." };
  }
  if (trimmed.includes("\u0000")) {
    return { ok: false, text: null, reason: "Message text is invalid." };
  }
  const max = COMMUNITY_LIMITS.MESSAGE_MAX_CODE_POINTS;
  if (countCommunityCodePoints(trimmed) > max) {
    return { ok: false, text: null, reason: `Message cannot exceed ${max} characters.` };
  }
  return { ok: true, text: trimmed, reason: null };
}
