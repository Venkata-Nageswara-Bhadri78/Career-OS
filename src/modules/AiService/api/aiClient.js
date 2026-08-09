import { API_BASE_URL, AI_ENDPOINTS } from "./aiEndpoints";
import { getAuthorizationHeader, getAccessToken } from "../../AuthService/api/tokenStorage";

export class ApiError extends Error {
  constructor({ message, status, data }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function buildUrl(endpoint, query = {}) {
  const url = new URL(endpoint, API_BASE_URL);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      Array.isArray(v) ? v.forEach((i) => url.searchParams.append(k, i)) : url.searchParams.append(k, v);
    }
  });
  return url.toString();
}

export function resolveBearerToken(explicitToken = null) {
  if (explicitToken) {
    const trimmed = String(explicitToken).trim();
    return trimmed.startsWith("Bearer ") || trimmed.startsWith("bearer ") ? trimmed : `Bearer ${trimmed}`;
  }

  const authHeader = getAuthorizationHeader();
  if (authHeader) return authHeader;

  const rawToken =
    getAccessToken() ||
    localStorage.getItem("auth_access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("auth_access_token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token");

  if (!rawToken) return null;
  const trimmed = String(rawToken).trim();
  return trimmed.startsWith("Bearer ") || trimmed.startsWith("bearer ") ? trimmed : `Bearer ${trimmed}`;
}

/**
 * Standard HTTP Request handler for JSON endpoints
 */
export async function request({ endpoint, method = "GET", body = null, headers = {}, query = {}, timeout = 30000, signal }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const bearerToken = resolveBearerToken();

  const reqHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(bearerToken ? { Authorization: bearerToken } : {}),
    ...headers,
  };

  try {
    const res = await fetch(buildUrl(endpoint, query), {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : null,
      signal: signal ?? controller.signal,
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        throw new ApiError({
          message: data?.message || (res.status === 403 ? "Forbidden: Your session has expired or you lack permissions." : "Unauthorized: Please log in again."),
          status: res.status,
          data,
        });
      }
      throw new ApiError({ message: data?.message || res.statusText, status: res.status, data });
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") throw new ApiError({ message: "Request timed out.", status: 408, data: null });
    throw new ApiError({ message: err.message || "Network error occurred.", status: 500, data: null });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Robust token extractor for varied backend SSE response formats:
 * - OpenAI/Spring AI JSON: { "content": "..." }, { "output": { "text": "..." } }, { "generation": { "text": "..." } }
 * - OpenAI delta choices: { "choices": [{ "delta": { "content": "..." } }] }
 * - Plain raw text string deltas
 */
function extractDeltaText(rawPayload) {
  if (typeof rawPayload !== "string") return "";
  const trimmed = rawPayload.trim();
  if (!trimmed || trimmed === "[DONE]" || trimmed === "DONE") return "";

  try {
    const data = JSON.parse(trimmed);
    if (typeof data === "string") return data;
    if (data.content !== undefined && data.content !== null) return String(data.content);
    if (data.text !== undefined && data.text !== null) return String(data.text);
    if (data.delta !== undefined && data.delta !== null) {
      if (typeof data.delta === "string") return data.delta;
      if (data.delta.content) return String(data.delta.content);
      if (data.delta.text) return String(data.delta.text);
    }
    if (data.output?.text !== undefined) return String(data.output.text);
    if (data.generation?.text !== undefined) return String(data.generation.text);
    if (Array.isArray(data.choices) && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.delta?.content) return String(choice.delta.content);
      if (choice.delta?.text) return String(choice.delta.text);
      if (choice.text) return String(choice.text);
    }
    if (data.message?.content) return String(data.message.content);
    return "";
  } catch {
    // If not JSON, it is a plain text delta
    return rawPayload;
  }
}

/**
 * Check if the SSE chunk represents a completion signal
 */
function isEndChunk(rawPayload) {
  if (typeof rawPayload !== "string") return false;
  const trimmed = rawPayload.trim();
  if (trimmed === "[DONE]" || trimmed === "DONE" || trimmed === "[COMPLETED]") return true;
  try {
    const data = JSON.parse(trimmed);
    return Boolean(data.isCompleted || data.done || data.finish_reason === "stop" || data.status === "COMPLETED");
  } catch {
    return false;
  }
}

/**
 * Real-time SSE Token Streaming client for AI Chat
 * Consumes Server-Sent Events (POST /api/v1/ai/chat/stream)
 *
 * @param {Object} options
 * @param {Object} options.payload - { prompt, jobDescription, jobId, customResumeText, mode, temperature }
 * @param {string} [options.token] - Optional explicit JWT token
 * @param {function} [options.onToken] - (deltaText, accumulatedText) => void
 * @param {function} [options.onComplete] - (fullAccumulatedText) => void
 * @param {function} [options.onError] - (error) => void
 * @param {AbortSignal} [options.signal] - Abort signal to cancel stream
 */
export async function streamAiChat({
  payload,
  token = null,
  onToken = () => {},
  onComplete = () => {},
  onError = () => {},
  signal = null,
}) {
  const bearerToken = resolveBearerToken(token);

  const headers = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    ...(bearerToken ? { Authorization: bearerToken } : {}),
  };

  try {
    const url = buildUrl(AI_ENDPOINTS.STREAM_CHAT);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new ApiError({
        message: errorJson.message || `AI Service Error (${response.status}): ${response.statusText}`,
        status: response.status,
        data: errorJson,
      });
    }

    if (!response.body) {
      throw new ApiError({
        message: "Streaming is not supported by the browser or response body is empty.",
        status: 500,
        data: null,
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const decodedChunk = decoder.decode(value, { stream: true });
        // #region agent log
        fetch('http://127.0.0.1:7259/ingest/92ea2b9a-6250-4295-96e5-480e481df005',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1c9d83'},body:JSON.stringify({sessionId:'1c9d83',runId:'run1',hypothesisId:'H1_raw_chunk',location:'aiClient.js:207',message:'raw decoded chunk from reader',data:{decodedChunk},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        buffer += decodedChunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? ""; // Retain incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue; // SSE comment or heartbeat

          // Standard SSE control fields describe metadata about the event (its name,
          // last-event-id, or reconnection delay) - they are never message content and
          // must never fall through to the raw-text fallback below.
          if (/^(?:event|id|retry):/i.test(trimmed)) continue;

          let dataStr = line;
          let isSse = false;

          if (trimmed.startsWith("data:")) {
            dataStr = line.replace(/^\s*data:\s?/, "");
            isSse = true;
          }

          const isEventLine = trimmed.startsWith("event:");
          const endChunkResult = isEndChunk(dataStr);
          // #region agent log
          fetch('http://127.0.0.1:7259/ingest/92ea2b9a-6250-4295-96e5-480e481df005',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1c9d83'},body:JSON.stringify({sessionId:'1c9d83',runId:'run1',hypothesisId:'H2_line_classification',location:'aiClient.js:213',message:'per-line SSE classification',data:{line,trimmed,isSse,isEventLine,dataStr,endChunkResult},timestamp:Date.now()})}).catch(()=>{});
          // #endregion

          if (endChunkResult) {
            onComplete(accumulatedText);
            return;
          }

          const delta = extractDeltaText(dataStr);
          // #region agent log
          fetch('http://127.0.0.1:7259/ingest/92ea2b9a-6250-4295-96e5-480e481df005',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1c9d83'},body:JSON.stringify({sessionId:'1c9d83',runId:'run1',hypothesisId:'H3_delta_extraction',location:'aiClient.js:228',message:'delta computed for line, about to append if truthy',data:{isEventLine,dataStr,delta,willAppendAsContent:Boolean(delta)},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          if (delta) {
            accumulatedText += delta;
            onToken(delta, accumulatedText);
          } else if (!isSse && line) {
            // Raw text chunk stream fallback
            accumulatedText += line + "\n";
            onToken(line + "\n", accumulatedText);
          }
        }
      }
    } catch (readErr) {
      // #region agent log
      fetch('http://127.0.0.1:7259/ingest/92ea2b9a-6250-4295-96e5-480e481df005',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1c9d83'},body:JSON.stringify({sessionId:'1c9d83',runId:'run1',hypothesisId:'H5_abrupt_close',location:'aiClient.js:239',message:'reader.read() threw mid-stream, checking accumulated text',data:{readErrMessage:readErr?.message,readErrName:readErr?.name,accumulatedText},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      // If the backend closes the connection abruptly after sending tokens,
      // treat it as successful stream termination instead of showing a fatal network error
      if (accumulatedText.trim().length > 0) {
        console.info("Stream closed with accumulated response:", readErr);
        onComplete(accumulatedText);
        return;
      }
      throw readErr;
    }

    // Flush any remaining buffer if present
    if (buffer.trim() && !/^(?:event|id|retry):/i.test(buffer.trim())) {
      let dataStr = buffer;
      if (buffer.trim().startsWith("data:")) {
        dataStr = buffer.replace(/^\s*data:\s?/, "");
      }
      if (!isEndChunk(dataStr)) {
        const delta = extractDeltaText(dataStr) || (!buffer.trim().startsWith("data:") ? buffer : "");
        if (delta) {
          accumulatedText += delta;
          onToken(delta, accumulatedText);
        }
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7259/ingest/92ea2b9a-6250-4295-96e5-480e481df005',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1c9d83'},body:JSON.stringify({sessionId:'1c9d83',runId:'run1',hypothesisId:'H4_final_text',location:'aiClient.js:265',message:'final accumulatedText passed to onComplete (natural end of stream)',data:{accumulatedText},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    onComplete(accumulatedText);
  } catch (error) {
    if (signal?.aborted || error.name === "AbortError") {
      console.info("AI Stream cancelled by user.");
      return;
    }
    const normalized = error instanceof ApiError ? error : new ApiError({ message: error.message || "Streaming failed.", status: 500, data: null });
    onError(normalized);
  }
}

export const get = (endpoint, query, options) => request({ endpoint, method: "GET", query, ...options });
export const post = (endpoint, body, options) => request({ endpoint, method: "POST", body, ...options });

const aiClient = { request, streamAiChat, get, post, buildUrl };
export default aiClient;
