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

export function formatChatTime(value) {
  if (!value) return "";
  const raw = typeof value === "string" ? value.trim() : "";
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return "";
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0),
    Number(match[6] ?? 0)
  );
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function isEmailOrOutreachBlock(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("### subject:") ||
    /(?:^|\n)\s*(?:###\s*)?subject:/i.test(text) ||
    lower.includes("dear hiring") ||
    lower.includes("dear [hiring") ||
    lower.includes("hi [hiring") ||
    lower.includes("hi [recruiter") ||
    lower.includes("draft cover letter") ||
    lower.includes("cold email")
  );
}

export function parseEmailContent(text) {
  if (!text) return { subject: "", body: text };
  const subjectMatch = text.match(/(?:###\s*)?Subject:\s*([^\n]+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : "";
  let body = text;
  if (subjectMatch) body = text.replace(subjectMatch[0], "").trim();
  return { subject, body };
}

export function extensionForLanguage(language, languageMap) {
  const key = String(language || "txt").trim().toLowerCase();
  return languageMap?.[key] || "txt";
}

export function downloadTextFile(filename, contents) {
  const blob = new Blob([contents ?? ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function buildTranscriptMarkdown({ title, messages }) {
  const heading = title ? `# ${title}\n\n` : "# Job chat\n\n";
  const body = (messages || [])
    .map((turn) => `## Turn ${turn.turnNumber}\n\n**You**\n\n${turn.userPrompt}\n\n**Assistant**\n\n${turn.aiResponse}`)
    .join("\n\n---\n\n");
  return `${heading}${body}\n`;
}
