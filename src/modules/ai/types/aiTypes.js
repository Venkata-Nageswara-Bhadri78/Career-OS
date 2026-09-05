/**
 * @typedef {"GENERAL_CHAT"|"RESUME_REVIEW"|"COVER_LETTER"|"COLD_EMAIL"|"INTERVIEW_PREP"|"MATCH_ANALYSIS"} AiMode
 */

/**
 * @typedef {Object} AiChatRequest
 * @property {string} prompt
 * @property {string} [jobDescription]
 * @property {number} [jobId]
 * @property {number} [resumeId]
 * @property {string} [customResumeText]
 * @property {AiMode} [mode]
 * @property {number} [temperature]
 */

/**
 * @typedef {Object} AiChatResponse
 * @property {string} content
 * @property {string} [model]
 * @property {string} [finishReason]
 * @property {AiMode} [mode]
 * @property {number|null} [promptTokens]
 * @property {number|null} [completionTokens]
 * @property {number|null} [totalTokens]
 * @property {string} [timestamp]
 */

/**
 * @typedef {Object} AiStreamChunk
 * @property {string} [content]
 * @property {string} [finishReason]
 * @property {string} [model]
 * @property {string} [timestamp]
 * @property {boolean} [isCompleted]
 * @property {boolean} [completed]
 */

/**
 * @typedef {Object} AiHealthMetadata
 * @property {string} [status]
 * @property {string} [healthCheckType]
 * @property {string} [activeModel]
 * @property {boolean} [streamingSupported]
 * @property {string} [timestamp]
 */

/**
 * @typedef {"ready"|"missing"|"pending"|"failed"|"rateLimited"|"error"|"idle"} ResumeContextStatus
 */

/**
 * @typedef {Object} AiChatMessage
 * @property {string} id
 * @property {"user"|"assistant"} role
 * @property {string} content
 * @property {AiMode} [mode]
 * @property {string} [createdAt]
 * @property {boolean} [stopped]
 * @property {boolean} [failed]
 */

export {};
