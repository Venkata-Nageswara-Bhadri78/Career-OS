/**
 * @typedef {Object} JobExtractionRequest
 * @property {string} sourceUrl
 * @property {string} rawJobText
 */

/**
 * @typedef {Object} JobExtractionResult
 * @property {string} sourceUrl
 * @property {string} originalDescription
 * @property {string} [description]
 * @property {string} [title]
 * @property {string} [company]
 * @property {string} [location]
 * @property {string} [employmentType]
 * @property {string} [workMode]
 * @property {string} [experience]
 * @property {string} [salary]
 * @property {string} [education]
 * @property {string} [department]
 * @property {string} [industry]
 * @property {string} [sourcePlatform]
 * @property {string[]} skills
 * @property {boolean} requiresManualReview
 */

/**
 * @typedef {Object} ExtractFormErrors
 * @property {string|null} url
 * @property {string|null} text
 * @property {string|null} general
 */

/**
 * @typedef {"input" | "loading" | "review"} ExtractionStep
 */

export {};
