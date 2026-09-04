const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function toSafeHref(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    return value;
  }
  try {
    const parsed = new URL(value);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function hostnameFromHref(href) {
  try {
    return new URL(href).hostname;
  } catch {
    return "";
  }
}
