/**
 * @typedef {Object} ChatMessageTurn
 * @property {number} id
 * @property {number} turnNumber
 * @property {string} userPrompt
 * @property {string} aiResponse
 * @property {string|null} createdAt
 */

/**
 * @typedef {Object} ChatHistoryView
 * @property {number|null} chatSessionId
 * @property {number} jobId
 * @property {string|null} chatTitle
 * @property {ChatMessageTurn[]} messages
 * @property {number} page
 * @property {number} size
 * @property {number} totalElements
 * @property {number} totalPages
 */

/**
 * @typedef {Object} ChatSummaryView
 * @property {number} jobId
 * @property {number|null} chatSessionId
 * @property {string} title
 * @property {string|null} jobTitle
 * @property {string|null} company
 * @property {string|null} updatedAt
 */

/**
 * @typedef {Object} SendTurnView
 * @property {number|null} chatSessionId
 * @property {string|null} chatTitle
 * @property {ChatMessageTurn} latestTurn
 */

/**
 * @typedef {"idle"|"loading"|"ready"|"error"} ChatHistoryStatus
 */

/**
 * @typedef {"idle"|"sending"|"failed"} ChatSendStatus
 */

/**
 * @typedef {"validation"|"notFound"|"conflict"|"resumePending"|"resumeFailed"|"rateLimit"|"aiFailed"|"unavailable"|"timeout"|"network"|"cancelled"|"turnLimit"|"auth"|"generic"} ChatErrorKind
 */

/**
 * @typedef {Object} ChatMappedError
 * @property {ChatErrorKind} kind
 * @property {string} message
 * @property {boolean} canRetry
 * @property {boolean} uncertain
 * @property {boolean} reconcile
 * @property {boolean} profileLink
 * @property {number|null} retryAfter
 */

export {};
