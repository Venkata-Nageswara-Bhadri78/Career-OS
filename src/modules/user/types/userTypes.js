/**
 * @typedef {Object} ApiEnvelope
 * @property {boolean} success
 * @property {string} message
 * @property {*} data
 * @property {string} timestamp
 */

/**
 * @typedef {Object} UserProfileRequest
 * @property {string|null} [headline]
 * @property {string|null} [summary]
 * @property {string|null} [technicalSkills]
 */

/**
 * @typedef {Object} WorkExperience
 * @property {number} id
 * @property {string} companyName
 * @property {string} jobTitle
 * @property {number} startYear
 * @property {number|null} [endYear]
 * @property {string|null} [description]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} Education
 * @property {number} id
 * @property {string} institutionName
 * @property {string} field
 * @property {number} startYear
 * @property {number|null} [endYear]
 * @property {string|null} [scoreOrGrade]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} Project
 * @property {number} id
 * @property {string} projectTitle
 * @property {string|null} [projectDescription]
 * @property {string|null} [projectLink]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} AdditionalInfo
 * @property {number} id
 * @property {string} type
 * @property {string|null} [description]
 * @property {string|null} [link]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} ProfileLink
 * @property {number} id
 * @property {string} url
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} UserProfile
 * @property {number} id
 * @property {string} fullName
 * @property {string} email
 * @property {string|null} [headline]
 * @property {string|null} [summary]
 * @property {string|null} [technicalSkills]
 * @property {WorkExperience[]} workExperiences
 * @property {Education[]} educations
 * @property {Project[]} projects
 * @property {AdditionalInfo[]} additionalInformation
 * @property {ProfileLink[]} profileLinks
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} ResumeRow
 * @property {number} id
 * @property {string} originalFilename
 * @property {number} fileSize
 * @property {boolean} highPriority
 */

/**
 * @typedef {Object} ResumeUpload
 * @property {number} resumeId
 * @property {string} [message]
 */

/**
 * @typedef {'unknown'|'pending'|'ready'|'failed'|'missing'|'rateLimited'|'error'} ParseStatus
 */

export {};
