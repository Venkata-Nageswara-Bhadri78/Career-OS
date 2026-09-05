function normalizeNewlines(value) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function parseSseBlock(block) {
  let eventName = "";
  const dataLines = [];

  for (const rawLine of block.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith(":")) continue;
    if (/^event:/i.test(line)) {
      eventName = line.slice(line.indexOf(":") + 1).trim();
      continue;
    }
    if (/^(?:id|retry):/i.test(line)) continue;
    if (/^data:/i.test(line)) {
      dataLines.push(line.replace(/^data:\s?/i, ""));
    }
  }

  if (!eventName && dataLines.length === 0) return null;
  return {
    event: (eventName || "message").toLowerCase(),
    data: dataLines.join("\n"),
  };
}

export function consumeSseFrames(buffer) {
  const normalized = normalizeNewlines(buffer);
  const events = [];
  let rest = normalized;

  while (true) {
    const idx = rest.indexOf("\n\n");
    if (idx === -1) break;
    const block = rest.slice(0, idx);
    rest = rest.slice(idx + 2);
    const parsed = parseSseBlock(block);
    if (parsed) events.push(parsed);
  }

  return { events, rest };
}

export function parseSseData(raw) {
  const text = String(raw ?? "").trim();
  if (!text || text === "[DONE]" || text === "DONE") return { content: "", done: true };
  try {
    const data = JSON.parse(text);
    if (typeof data === "string") return { content: data };
    if (data && typeof data === "object") return data;
    return { content: "" };
  } catch {
    return { content: raw };
  }
}

export function readChunkText(chunk) {
  if (chunk == null) return "";
  if (typeof chunk === "string") return chunk;
  if (typeof chunk.content === "string") return chunk.content;
  return "";
}

export function isErrorChunk(eventName, chunk) {
  if (eventName === "error") return true;
  const reason = String(chunk?.finishReason || "").toUpperCase();
  return reason === "ERROR";
}

export function isDoneChunk(eventName, chunk) {
  if (eventName === "done") return true;
  if (chunk?.done === true) return true;
  const completed = chunk?.isCompleted === true || chunk?.completed === true;
  const reason = String(chunk?.finishReason || "").toUpperCase();
  return completed && reason !== "ERROR";
}

export function stripAiErrorPrefix(text) {
  return String(text || "")
    .replace(/^⚠️\s*/, "")
    .replace(/^\*\*Error:\*\*\s*/i, "")
    .replace(/^AI Service Error:\s*/i, "")
    .trim();
}
