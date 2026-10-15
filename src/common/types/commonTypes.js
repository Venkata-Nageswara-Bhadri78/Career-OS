/**
 * Shared kernel DTOs. Common owns the envelope every module speaks.
 *
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {*} [data]
 * @property {string} [timestamp] Server LocalDateTime without timezone offset
 *
 * @typedef {Object} ShellUser
 * @property {number|string} [id]
 * @property {string|null} [username]
 * @property {string} [fullName]
 * @property {string} [email]
 * @property {string} [role]
 * @property {boolean} [passwordConfigured]
 * @property {boolean} [googleLinked]
 */

export {};
