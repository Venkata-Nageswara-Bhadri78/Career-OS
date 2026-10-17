import { isSameCommunityUser } from "./communityIdentity";

export function presenceStatus(known, onlineIds, userId) {
  if (!known) return "unknown";
  const match = [...onlineIds].some((id) => isSameCommunityUser(id, userId));
  return match ? "online" : "offline";
}

export function onlineIdSet(rows) {
  const next = new Set();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (row?.userId != null) next.add(String(row.userId));
  });
  return next;
}
