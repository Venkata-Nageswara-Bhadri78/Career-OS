import { JOB_EXTRACTION_LIMITS } from "../config/jobExtractionConfig";

const FIELD_LIMITS = Object.freeze({
  title: JOB_EXTRACTION_LIMITS.TITLE_MAX,
  company: JOB_EXTRACTION_LIMITS.COMPANY_MAX,
  location: JOB_EXTRACTION_LIMITS.LOCATION_MAX,
  employmentType: JOB_EXTRACTION_LIMITS.EMPLOYMENT_TYPE_MAX,
  workMode: JOB_EXTRACTION_LIMITS.WORK_MODE_MAX,
  experience: JOB_EXTRACTION_LIMITS.EXPERIENCE_MAX,
  salary: JOB_EXTRACTION_LIMITS.SALARY_MAX,
  education: JOB_EXTRACTION_LIMITS.EDUCATION_MAX,
  department: JOB_EXTRACTION_LIMITS.DEPARTMENT_MAX,
  industry: JOB_EXTRACTION_LIMITS.INDUSTRY_MAX,
  sourcePlatform: JOB_EXTRACTION_LIMITS.SOURCE_PLATFORM_MAX,
  description: JOB_EXTRACTION_LIMITS.DESCRIPTION_MAX,
});

function asString(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function parseFieldErrors(message) {
  if (!message || typeof message !== "string") return {};
  const errors = {};
  message.split(",").forEach((part) => {
    const trimmed = part.trim();
    const colon = trimmed.indexOf(":");
    if (colon === -1) return;
    const field = trimmed.slice(0, colon).trim();
    const text = trimmed.slice(colon + 1).trim();
    if (!field || !text) return;
    if (field === "sourceUrl") errors.url = text;
    else if (field === "rawJobText") errors.text = text;
    else errors.general = errors.general ? `${errors.general} ${text}` : text;
  });
  return errors;
}

export function mapExtractionResult(data) {
  if (!data || typeof data !== "object") return null;
  const skills = Array.isArray(data.skills)
    ? data.skills.map((s) => asString(s).trim()).filter(Boolean)
    : [];

  return {
    sourceUrl: asString(data.sourceUrl),
    originalDescription: asString(data.originalDescription),
    description: asString(data.description),
    title: asString(data.title),
    company: asString(data.company),
    location: asString(data.location),
    employmentType: asString(data.employmentType),
    workMode: asString(data.workMode),
    experience: asString(data.experience),
    salary: asString(data.salary),
    education: asString(data.education),
    department: asString(data.department),
    industry: asString(data.industry),
    sourcePlatform: asString(data.sourcePlatform),
    skills,
    requiresManualReview: Boolean(data.requiresManualReview),
  };
}

export function toJobRequest(preview) {
  if (!preview) return null;
  const { requiresManualReview: _flag, ...rest } = preview;
  const payload = {
    sourceUrl: asString(rest.sourceUrl).trim(),
    originalDescription: asString(rest.originalDescription).trim(),
    title: asString(rest.title).trim(),
    company: asString(rest.company).trim(),
  };

  const optionalKeys = [
    "description",
    "location",
    "employmentType",
    "workMode",
    "experience",
    "salary",
    "education",
    "department",
    "industry",
    "sourcePlatform",
  ];

  optionalKeys.forEach((key) => {
    const value = asString(rest[key]).trim();
    if (value) payload[key] = value;
  });

  if (Array.isArray(rest.skills) && rest.skills.length > 0) {
    payload.skills = rest.skills.map((s) => asString(s).trim()).filter(Boolean);
  }

  return payload;
}

export function validateExtractForm({ sourceUrl, rawJobText }) {
  const errors = { url: null, text: null, general: null };
  const url = asString(sourceUrl).trim();
  const text = asString(rawJobText).trim();

  if (!url) {
    errors.url = "Job URL is required.";
  } else if (url.length > JOB_EXTRACTION_LIMITS.SOURCE_URL_MAX) {
    errors.url = `Job URL must be at most ${JOB_EXTRACTION_LIMITS.SOURCE_URL_MAX} characters.`;
  } else if (!/^https?:\/\//i.test(url)) {
    errors.url = "Job URL must start with http:// or https://.";
  }

  if (!text) {
    errors.text = "Pasted job description is required.";
  } else if (text.length > JOB_EXTRACTION_LIMITS.RAW_JOB_TEXT_MAX) {
    errors.text = `Description must be at most ${JOB_EXTRACTION_LIMITS.RAW_JOB_TEXT_MAX.toLocaleString()} characters.`;
  }

  return errors;
}

export function validateReviewForm(data) {
  const errors = {};
  if (!asString(data?.title).trim()) errors.title = "Job title is required.";
  if (!asString(data?.company).trim()) errors.company = "Company name is required.";

  Object.entries(FIELD_LIMITS).forEach(([key, max]) => {
    const value = asString(data?.[key]);
    if (value.length > max) {
      errors[key] = `Must be at most ${max} characters.`;
    }
  });

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  if (skills.length > JOB_EXTRACTION_LIMITS.SKILLS_MAX_COUNT) {
    errors.skills = `At most ${JOB_EXTRACTION_LIMITS.SKILLS_MAX_COUNT} skills allowed.`;
  }
  skills.forEach((skill, idx) => {
    if (asString(skill).length > JOB_EXTRACTION_LIMITS.SKILL_MAX) {
      errors.skills = `Each skill must be at most ${JOB_EXTRACTION_LIMITS.SKILL_MAX} characters.`;
    }
  });

  return errors;
}

export function mapJobExtractionError(error) {
  const status = error?.status ?? 500;
  const retryAfter = Number.isFinite(error?.retryAfter) ? error.retryAfter : null;
  const rawMessage = typeof error?.message === "string" ? error.message : "";
  const fieldErrors = parseFieldErrors(rawMessage);

  let message = rawMessage || "Something went wrong. Please try again.";
  const result = { status, message, fieldErrors, retryAfter };

  if (status === 0) {
    result.message = "Unable to reach the server. Please try again.";
  } else if (status === 408) {
    result.message = "Extraction timed out. This can take up to a minute — please try again.";
  } else if (status === 429) {
    result.message = "Too many requests. Please try again later.";
  } else if (status === 502) {
    result.message = rawMessage || "The AI service encountered an error. You can fill the form manually and save.";
  } else if (status === 503) {
    result.message =
      rawMessage || "The AI service is temporarily unavailable. Please try again shortly.";
  } else if (status === 409) {
    result.message = rawMessage || "This post was already added to your records.";
  } else if (status === 403) {
    result.message = rawMessage || "Please verify your email before using this feature.";
  } else if (status === 401) {
    result.message = rawMessage || "Your session has ended. Please sign in again.";
  } else if (status === 400 && Object.keys(fieldErrors).length > 0) {
    result.message = null;
  }

  return result;
}

export function wasUrlCanonicalized(inputUrl, canonicalUrl) {
  return asString(inputUrl).trim() !== asString(canonicalUrl).trim();
}
