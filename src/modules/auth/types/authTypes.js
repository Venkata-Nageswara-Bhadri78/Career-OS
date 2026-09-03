/**
 * @typedef {Object} AuthTokens
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {string} tokenType
 */

/**
 * @typedef {Object} AuthUser
 * @property {number|string} id
 * @property {string} username
 * @property {string} fullName
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} RegisterPayload
 * @property {string} username
 * @property {string} fullName
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} email
 * @property {string} password
 * @property {boolean} [rememberMe]
 */

/**
 * @typedef {Object} FieldErrors
 * @property {string} [username]
 * @property {string} [fullName]
 * @property {string} [email]
 * @property {string} [password]
 * @property {string} [confirmPassword]
 * @property {string} [otp]
 * @property {string} [token]
 * @property {string} [newPassword]
 */

export {};
