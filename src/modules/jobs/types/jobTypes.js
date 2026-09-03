/**
 * @typedef {Object} JobSummary
 * @property {number} id
 * @property {string} title
 * @property {string} company
 * @property {string} [location]
 * @property {string} [employmentType]
 * @property {string} [workMode]
 * @property {string} [experience]
 * @property {string} [salary]
 * @property {string} [sourcePlatform]
 * @property {string[]} skills
 * @property {string} createdAt
 */

/**
 * @typedef {JobSummary & {
 *   sourceUrl: string;
 *   originalDescription: string;
 *   description?: string;
 *   updatedAt: string;
 *   education?: string;
 *   department?: string;
 *   industry?: string;
 * }} Job
 */

/**
 * @typedef {Object} JobPage
 * @property {JobSummary[]} content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} number
 * @property {number} size
 */

/**
 * @typedef {Object} JobRequest
 * @property {string} sourceUrl
 * @property {string} originalDescription
 * @property {string} title
 * @property {string} company
 * @property {string} [description]
 * @property {string} [location]
 * @property {string} [employmentType]
 * @property {string} [workMode]
 * @property {string} [experience]
 * @property {string} [salary]
 * @property {string} [education]
 * @property {string} [department]
 * @property {string} [industry]
 * @property {string} [sourcePlatform]
 * @property {string[]} [skills]
 */

export {};
