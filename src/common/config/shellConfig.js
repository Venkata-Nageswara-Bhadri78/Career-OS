import { APP_PATHS, isJobChatPath } from "./appPaths";

export const SHELL_BRAND = Object.freeze({
  letter: "C",
  name: "Career OS",
  tagline: "Job Management",
});

export const SHELL_NAV_ITEMS = Object.freeze([
  { id: "dashboard", name: "Dashboard", path: APP_PATHS.DASHBOARD, icon: "dashboard" },
  { id: "ai", name: "AI Assistant", path: APP_PATHS.AI, icon: "ai" },
  { id: "profile", name: "Profile", path: APP_PATHS.PROFILE, icon: "profile" },
]);

export const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

export function isNavItemActive(item, pathname) {
  if (!item?.path) return false;
  if (item.id === "ai") return pathname === APP_PATHS.AI || pathname.startsWith(`${APP_PATHS.AI}/`) || isJobChatPath(pathname);
  if (item.id === "dashboard") return pathname === APP_PATHS.DASHBOARD || pathname.startsWith(`${APP_PATHS.DASHBOARD}/`);
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
