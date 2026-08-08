import aiClient from "./aiClient";
import { AI_ENDPOINTS } from "./aiEndpoints";

/**
 * AI Service API Layer
 */
export const aiApi = {
  /**
   * Stream tokens for chat request via Server-Sent Events (SSE)
   * @param {Object} payload - { prompt, jobDescription, jobId, customResumeText, mode, temperature }
   * @param {Object} callbacks - { onToken, onComplete, onError }
   * @param {Object} [options] - { signal, token }
   */
  streamChat: (payload, callbacks = {}, options = {}) => {
    return aiClient.streamAiChat({
      payload,
      token: options.token,
      signal: options.signal,
      onToken: callbacks.onToken,
      onComplete: callbacks.onComplete,
      onError: callbacks.onError,
    });
  },

  /**
   * Synchronous blocking AI Chat completion
   * @param {Object} payload - { prompt, jobDescription, jobId, customResumeText, mode, temperature }
   */
  chatSync: async (payload, options = {}) => {
    const res = await aiClient.post(AI_ENDPOINTS.CHAT, payload, options);
    return res?.data ?? res;
  },

  /**
   * Get Candidate Resume Context currently configured in AI service
   */
  getResumeContext: async (options = {}) => {
    const res = await aiClient.get(AI_ENDPOINTS.RESUME_CONTEXT, {}, options);
    return res?.data ?? res;
  },

  /**
   * Check AI Service health and active model provider status
   */
  getHealth: async (options = {}) => {
    const res = await aiClient.get(AI_ENDPOINTS.HEALTH, {}, options);
    return res?.data ?? res;
  },
};

export default aiApi;
