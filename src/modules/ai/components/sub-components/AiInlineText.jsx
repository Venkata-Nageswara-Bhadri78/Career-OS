import AiSafeLink from "./AiSafeLink";

export default function AiInlineText({ text }) {
  if (!text) return null;

  const parts = [];
  let remaining = text;
  let key = 0;
  const tokenRegex = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/;

  while (remaining) {
    const match = remaining.match(tokenRegex);
    if (!match) {
      parts.push(remaining);
      break;
    }

    const index = match.index;
    if (index > 0) parts.push(remaining.substring(0, index));

    const token = match[0];
    if (token.startsWith("`")) {
      parts.push(
        <code key={`c-${key++}`} className="px-1.5 py-0.5 rounded-md bg-field text-ink font-mono text-[11px] border border-line">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      parts.push(
        <AiSafeLink key={`a-${key++}`} href={linkMatch?.[2]}>
          {linkMatch?.[1] || token}
        </AiSafeLink>
      );
    } else if (token.startsWith("**")) {
      parts.push(
        <strong key={`b-${key++}`} className="font-bold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(
        <em key={`i-${key++}`} className="italic text-ink/80">
          {token.slice(1, -1)}
        </em>
      );
    }

    remaining = remaining.substring(index + token.length);
  }

  return parts;
}
