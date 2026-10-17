import { APP_PATHS } from "../../../common/config/appPaths";

export function readCommunityIdFromPath(pathname) {
  const match = String(pathname || "").match(/^\/community\/([^/]+)\/?$/);
  if (!match || match[1] === "start") return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function isCommunityAreaPath(pathname) {
  return pathname === APP_PATHS.COMMUNITY || String(pathname || "").startsWith(`${APP_PATHS.COMMUNITY}/`);
}

export function communityJobLine(community) {
  return [community?.title, community?.company, community?.location]
    .filter((part) => typeof part === "string" && part.trim())
    .join(" · ");
}

export function communityLabel(community) {
  const name = typeof community?.communityName === "string" ? community.communityName.trim() : "";
  return name || communityJobLine(community) || "Community";
}

export function communityInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
