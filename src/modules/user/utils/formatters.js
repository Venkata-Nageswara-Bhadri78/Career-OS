import { USER_LIMITS } from "../config/userConfig";

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

export function toSafeHref(raw) {
  const value = asText(raw).trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function hostnameFromHref(href) {
  const safe = toSafeHref(href);
  if (!safe) return "";
  try {
    return new URL(safe).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function splitSkills(value) {
  return asText(value)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function yearRangeLabel(startYear, endYear) {
  const start = Number(startYear);
  const startLabel = Number.isFinite(start) ? String(start) : "—";
  if (endYear == null || endYear === "") return `${startLabel} – Present`;
  const end = Number(endYear);
  return `${startLabel} – ${Number.isFinite(end) ? end : "—"}`;
}

export function experienceYears(experiences = []) {
  if (!experiences.length) return 0;
  const current = new Date().getFullYear();
  const starts = experiences.map((item) => Number(item.startYear)).filter(Number.isFinite);
  const ends = experiences.map((item) => (item.endYear == null ? current : Number(item.endYear))).filter(Number.isFinite);
  if (!starts.length || !ends.length) return 0;
  return Math.max(0, Math.max(...ends) - Math.min(...starts));
}

export function formatRetryAfter(seconds) {
  const n = Number.parseInt(String(seconds ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return "a moment";
  if (n === 1) return "1 second";
  if (n < 60) return `${n} seconds`;
  const minutes = Math.ceil(n / 60);
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

export function formatApiError(err, fallback = "Something went wrong.") {
  const message = asOptionalText(err?.message) || fallback;
  if (err?.status === 429) {
    return `${message} Try again in ${formatRetryAfter(err.retryAfter)}.`;
  }
  return message;
}

export function parseFieldErrors(message) {
  const text = asText(message).trim();
  if (!text || !text.includes(":")) return {};
  const errors = {};
  text.split(", ").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx <= 0) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key && value) errors[key] = value;
  });
  return errors;
}

export function emptyToNull(value) {
  const text = asText(value).trim();
  return text ? text : null;
}

export function validateYear(value, { required = false, label = "Year" } = {}) {
  if (value === "" || value == null) {
    return required ? `${label} is required.` : null;
  }
  const text = String(value).trim();
  if (!/^\d{4}$/.test(text)) return `${label} must be a 4-digit year.`;
  const year = Number.parseInt(text, 10);
  if (year < USER_LIMITS.YEAR_MIN || year > USER_LIMITS.YEAR_MAX) {
    return `${label} must be between ${USER_LIMITS.YEAR_MIN} and ${USER_LIMITS.YEAR_MAX}.`;
  }
  return null;
}

export function validateYearOrder(startYear, endYear) {
  if (startYear === "" || startYear == null || endYear === "" || endYear == null) return null;
  const start = Number.parseInt(String(startYear), 10);
  const end = Number.parseInt(String(endYear), 10);
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
  if (end < start) return "End year must be greater than or equal to start year.";
  return null;
}

export function validateHttpUrl(value, { required = false } = {}) {
  const text = asText(value).trim();
  if (!text) return required ? "URL is required." : null;
  if (text.length > USER_LIMITS.URL_MAX) return `URL must be at most ${USER_LIMITS.URL_MAX} characters.`;
  if (!toSafeHref(text)) return "Must be an http or https URL.";
  return null;
}

export function validateResumeFile(file) {
  if (!file) return "Choose a PDF resume to upload.";
  const name = asText(file.name);
  if (name.length > USER_LIMITS.RESUME_FILENAME_MAX) {
    return "Original filename must not exceed 255 characters.";
  }
  if (file.size <= 0) return "Resume cannot be empty.";
  if (file.size > USER_LIMITS.RESUME_MAX_BYTES) return "Maximum file size is 5 MB.";
  const type = asText(file.type).toLowerCase();
  const looksPdf = type === "application/pdf" || name.toLowerCase().endsWith(".pdf");
  if (!looksPdf) return "Only PDF files are allowed.";
  return null;
}

export async function assertPdfMagicBytes(file) {
  const slice = file.slice(0, 5);
  const buffer = await slice.arrayBuffer();
  const header = new TextDecoder("ascii").decode(buffer);
  if (!header.startsWith("%PDF")) {
    throw new Error("Only PDF files are allowed.");
  }
}

export function parseContentDispositionFilename(header) {
  const value = asText(header);
  if (!value) return null;
  const utfMatch = value.match(/filename\*=UTF-8''([^;]+)/i);
  const plainMatch = value.match(/filename="([^"]+)"/i) || value.match(/filename=([^;]+)/i);
  const raw = decodeURIComponent((utfMatch?.[1] || plainMatch?.[1] || "").trim());
  const cleaned = raw.replace(/[\r\n"]/g, "").trim();
  return cleaned || null;
}

export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "resume.pdf";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function copyToClipboard(text) {
  const value = asText(text).trim();
  if (!value) return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      /* fallback below */
    }
  }
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    area.setSelectionRange(0, value.length);
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export function openBlobPreview(blob) {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return Boolean(opened);
}
