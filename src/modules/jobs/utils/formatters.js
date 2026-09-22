export function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

export function truncate(text, length = 40) {
  if (!text) return "—";
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

/** Split a Jobs / extraction skills string into chip values. */
export function splitJobSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill ?? "").trim()).filter(Boolean);
  }
  if (typeof skills !== "string" || !skills.trim()) return [];
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

/** Join skill chips into the Jobs API comma-separated string. Empty → `""`. */
export function joinJobSkills(skills) {
  return splitJobSkills(skills).join(", ");
}

export function formatSkillsPreview(skills, maxLength = 28) {
  const joined = typeof skills === "string" ? skills.trim() : joinJobSkills(skills);
  if (!joined) return "—";
  if (joined.length <= maxLength) return joined;
  return `${joined.slice(0, maxLength).trim()}...`;
}

export function isSafeHttpUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback below */
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch {
    return false;
  }
}
