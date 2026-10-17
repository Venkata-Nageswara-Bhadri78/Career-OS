/**
 * Compare community user ids in one place so 7 and "7" stay the same person.
 * Source of the current user is useAuth().user.id (mapCurrentUser / data.id).
 * Message and member payloads use sender.userId / userId. Do not compare names.
 */
export function isSameCommunityUser(left, right) {
  if (left == null || right == null) return false;
  const a = String(left).trim();
  const b = String(right).trim();
  if (!a || !b) return false;
  return a === b;
}

export function isGroupedWithPrevious(message, previous) {
  if (!message || !previous) return false;
  return isSameCommunityUser(previous.sender?.userId, message.sender?.userId);
}
