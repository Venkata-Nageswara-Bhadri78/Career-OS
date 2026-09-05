export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
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

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function formatClock(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function isEmailOrOutreachBlock(text) {
  if (!text || typeof text !== "string") return false;
  const hasSubject = /(^|\n)\s*(?:#{1,6}\s*)?subject\s*:/i.test(text);
  if (!hasSubject) return false;
  return /(^|\n)\s*(dear|hi|hello)\b/i.test(text);
}

export function parseEmailContent(text) {
  if (!text) return { subject: "", body: "" };
  const subjectMatch = text.match(/(?:#{1,6}\s*)?Subject:\s*([^\n]+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : "";
  const body = subjectMatch ? text.replace(subjectMatch[0], "").trim() : text;
  return { subject, body };
}

export function buildTranscriptMarkdown({ modeLabel, messages }) {
  const lines = ["# Career Copilot", ""];
  if (modeLabel) {
    lines.push(`Mode: ${modeLabel}`, "");
  }
  (messages || []).forEach((message) => {
    const heading = message.role === "user" ? "You" : "Copilot";
    lines.push(`## ${heading}`, "", message.content || "", "");
  });
  return lines.join("\n").trim() + "\n";
}

export function wordCount(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
