/**
 * @typedef {Object} CustomPrompt
 * @property {number} id
 * @property {string} title
 * @property {string} prompt
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 */

/**
 * @typedef {Object} CustomPromptRequest
 * @property {string} title
 * @property {string} prompt
 */

/**
 * @typedef {"idle"|"loading"|"ready"|"error"} CustomPromptListStatus
 */

/**
 * @typedef {Object} CustomPromptMappedError
 * @property {number} status
 * @property {string} message
 * @property {boolean} stale
 */

export {};
