export const JOB_EXTRACTION_LIMITS = Object.freeze({
  SOURCE_URL_MAX: 2000,
  RAW_JOB_TEXT_MAX: 50000,
  TITLE_MAX: 255,
  COMPANY_MAX: 255,
  LOCATION_MAX: 255,
  EMPLOYMENT_TYPE_MAX: 100,
  WORK_MODE_MAX: 50,
  EXPERIENCE_MAX: 100,
  SALARY_MAX: 100,
  EDUCATION_MAX: 255,
  DEPARTMENT_MAX: 100,
  INDUSTRY_MAX: 100,
  SOURCE_PLATFORM_MAX: 50,
  DESCRIPTION_MAX: 50000,
  SKILL_MAX: 255,
  SKILLS_MAX_COUNT: 50,
});

/** Backend AI timeout is ~60s; allow headroom for network. */
export const PARSE_TIMEOUT_MS = 70_000;

export const EMPLOYMENT_TYPE_SUGGESTIONS = Object.freeze([
  "Full Time",
  "Part Time",
  "Contract",
  "Internship",
]);

export const WORK_MODE_SUGGESTIONS = Object.freeze(["Remote", "Hybrid", "On-site"]);
