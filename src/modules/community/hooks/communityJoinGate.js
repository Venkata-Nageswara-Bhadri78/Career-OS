import { joinCommunity } from "../api/communityApi";

const pendingAutoJoin = new Set();
const inflightJoins = new Map();

/**
 * `intent: "join"` must POST once. React strict mode remounts effects, and
 * replacing the history entry clears that intent before the request returns.
 * The pending set remembers the arrival; the inflight map shares one request.
 */
export function noteAutoJoin(communityId, state) {
  const key = String(communityId);
  if (state?.intent === "join") pendingAutoJoin.add(key);
  return pendingAutoJoin.has(key);
}

export function clearAutoJoin(communityId) {
  pendingAutoJoin.delete(String(communityId));
}

export function beginAutoJoin(communityId) {
  const key = String(communityId);
  if (!inflightJoins.has(key)) {
    const promise = joinCommunity(communityId).finally(() => {
      inflightJoins.delete(key);
      pendingAutoJoin.delete(key);
    });
    inflightJoins.set(key, promise);
  }
  return inflightJoins.get(key);
}
