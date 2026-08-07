/**
 * Helper to copy text to clipboard with fallback
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to legacy execCommand
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
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

/**
 * Format timestamp to friendly time string
 */
export function formatTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Helper to detect if a text block contains structured email/letter headers
 */
export function isEmailOrOutreachBlock(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("### subject:") ||
    lower.includes("subject:") ||
    lower.includes("dear [hiring") ||
    lower.includes("dear hiring") ||
    lower.includes("hi [hiring") ||
    lower.includes("hi [recruiter") ||
    lower.includes("draft cover letter") ||
    lower.includes("cold email")
  );
}

/**
 * Parses email structure: returns { subject, body } if detected
 */
export function parseEmailContent(text) {
  if (!text) return { subject: "", body: text };
  
  const subjectMatch = text.match(/(?:###\s*)?Subject:\s*([^\n]+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : "";
  
  let body = text;
  if (subjectMatch) {
    // Remove the subject line from body for cleaner editing
    body = text.replace(subjectMatch[0], "").trim();
  }
  
  return { subject, body };
}
