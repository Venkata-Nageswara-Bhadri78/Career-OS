import { JOB_EXTRACTION_LIMITS } from "../config/jobExtractionConfig";
import { parseResumeToJobScore } from "../../jobs/config/jobStatus";
import { joinJobSkills } from "../../jobs/utils/formatters";

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

function asPositiveInt(value) {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
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
    else if (field === "resume") errors.resume = text;
    else errors.general = errors.general ? `${errors.general} ${text}` : text;
  });
  return errors;
}

export function mapExtractionResult(data) {
  if (!data || typeof data !== "object") return null;
  const skills = typeof data.skills === "string" ? data.skills : joinJobSkills(data.skills);

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
    resume: asPositiveInt(data.resume),
    resumeToJobScore: parseResumeToJobScore(data.resumeToJobScore),
  };
}

export function mapPersistedExtraction(result) {
  const data = result?.data;
  const message = typeof result?.message === "string" ? result.message.trim() : "";
  if (!data || typeof data !== "object") {
    return { message, persistedAs: null, job: null, draft: null, failureReason: null };
  }
  const persistedAs = data.persistedAs === "JOB" || data.persistedAs === "DRAFT" ? data.persistedAs : null;
  const jobId = asPositiveInt(data.job?.id);
  const draftId = asPositiveInt(data.draft?.id);
  return {
    message,
    persistedAs,
    job: persistedAs === "JOB" && jobId ? { ...data.job, id: jobId } : null,
    draft: persistedAs === "DRAFT" && draftId ? { id: draftId, failureReason: asString(data.draft?.failureReason).trim() } : null,
    failureReason: asString(data.failureReason).trim(),
  };
}

export function toJobRequest(preview) {
  if (!preview) return null;
  const payload = {
    sourceUrl: asString(preview.sourceUrl).trim(),
    originalDescription: asString(preview.originalDescription).trim(),
    title: asString(preview.title).trim(),
    company: asString(preview.company).trim(),
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
    const value = asString(preview[key]).trim();
    if (value) payload[key] = value;
  });

  const skills = asString(preview.skills);
  if (skills.trim()) payload.skills = skills;

  const resumeId = asPositiveInt(preview.resume);
  if (resumeId) payload.resume = resumeId;
  const score = parseResumeToJobScore(preview.resumeToJobScore);
  if (score != null) payload.resumeToJobScore = score;

  return payload;
}

export function validateExtractForm({ sourceUrl, rawJobText, mode = "manual" }) {
  const errors = { url: null, text: null, general: null, resume: null };
  const url = asString(sourceUrl).trim();
  const text = asString(rawJobText).trim();
  const automated = mode === "automated";

  if (!url) {
    errors.url = "Job URL is required.";
  } else if (url.length > JOB_EXTRACTION_LIMITS.SOURCE_URL_MAX) {
    errors.url = `Job URL must be at most ${JOB_EXTRACTION_LIMITS.SOURCE_URL_MAX} characters.`;
  } else if (!/^https?:\/\//i.test(url)) {
    errors.url = "Job URL must start with http:// or https://.";
  }

  if (!automated && !text) {
    errors.text = "Pasted job description is required.";
  } else if (!automated && text.length > JOB_EXTRACTION_LIMITS.RAW_JOB_TEXT_MAX) {
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

  const skillsText = typeof data?.skills === "string" ? data.skills : joinJobSkills(data?.skills);
  if (skillsText.length > JOB_EXTRACTION_LIMITS.SKILLS_MAX_LENGTH) {
    errors.skills = `Skills cannot exceed ${JOB_EXTRACTION_LIMITS.SKILLS_MAX_LENGTH} characters.`;
  }

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
  } else if (status === 404 && /resume/i.test(rawMessage)) {
    result.fieldErrors = { ...fieldErrors, resume: rawMessage || "Resume not found." };
    result.message = null;
  } else if (status === 400 && Object.keys(fieldErrors).length > 0) {
    result.message = null;
  }

  return result;
}

export function wasUrlCanonicalized(inputUrl, canonicalUrl) {
  return asString(inputUrl).trim() !== asString(canonicalUrl).trim();
}
