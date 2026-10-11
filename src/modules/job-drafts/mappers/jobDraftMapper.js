import { parseResumeToJobScore } from "../../jobs/config/jobStatus";
import { isSafeHttpUrl, joinJobSkills } from "../../jobs/utils/formatters";
import { JOB_DRAFT_FAILURE_LABELS } from "../config/jobDraftConfig";

function asNullableText(value) {
  if (value == null) return null;
  const text = String(value);
  return text.length ? text : null;
}

function asPositiveInt(value) {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function asOptionalText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

/**
 * @param {unknown} row
 */
export function mapJobDraft(row) {
  if (!row || typeof row !== "object") return null;
  const id = asPositiveInt(row.id);
  if (!id) return null;
  const skills = row.skills == null ? null : typeof row.skills === "string" ? row.skills : joinJobSkills(row.skills);

  return {
    id,
    sourceUrl: asNullableText(row.sourceUrl),
    originalDescription: asNullableText(row.originalDescription),
    description: asNullableText(row.description),
    title: asNullableText(row.title),
    company: asNullableText(row.company),
    location: asNullableText(row.location),
    employmentType: asNullableText(row.employmentType),
    workMode: asNullableText(row.workMode),
    experience: asNullableText(row.experience),
    salary: asNullableText(row.salary),
    education: asNullableText(row.education),
    department: asNullableText(row.department),
    industry: asNullableText(row.industry),
    sourcePlatform: asNullableText(row.sourcePlatform),
    skills,
    resume: asPositiveInt(row.resume),
    resumeToJobScore: parseResumeToJobScore(row.resumeToJobScore),
    failureCategory: asNullableText(row.failureCategory),
    failureReason: asNullableText(row.failureReason),
    createdAt: asNullableText(row.createdAt),
    updatedAt: asNullableText(row.updatedAt),
  };
}

export function draftToForm(draft) {
  return {
    sourceUrl: draft?.sourceUrl || "",
    originalDescription: draft?.originalDescription || "",
    description: draft?.description || "",
    title: draft?.title || "",
    company: draft?.company || "",
    location: draft?.location || "",
    employmentType: draft?.employmentType || "",
    workMode: draft?.workMode || "",
    experience: draft?.experience || "",
    salary: draft?.salary || "",
    education: draft?.education || "",
    department: draft?.department || "",
    industry: draft?.industry || "",
    sourcePlatform: draft?.sourcePlatform || "",
    skills: draft?.skills || "",
    resume: draft?.resume ?? "",
    resumeToJobScore: draft?.resumeToJobScore ?? "",
  };
}

/**
 * Full replacement body. Blank optional fields are null so omitted values are not kept by accident.
 * @param {ReturnType<typeof draftToForm>} form
 */
export function toDraftUpdateRequest(form) {
  const text = (value) => asOptionalText(value);
  const resume = asPositiveInt(form?.resume);
  const scoreText = String(form?.resumeToJobScore ?? "").trim();
  const resumeToJobScore = scoreText === "" ? null : parseResumeToJobScore(scoreText);

  return {
    sourceUrl: text(form?.sourceUrl),
    originalDescription: text(form?.originalDescription),
    description: text(form?.description),
    title: text(form?.title),
    company: text(form?.company),
    location: text(form?.location),
    employmentType: text(form?.employmentType),
    workMode: text(form?.workMode),
    experience: text(form?.experience),
    salary: text(form?.salary),
    education: text(form?.education),
    department: text(form?.department),
    industry: text(form?.industry),
    sourcePlatform: text(form?.sourcePlatform),
    skills: text(form?.skills),
    resume,
    resumeToJobScore,
  };
}

export function missingDraftFields(form) {
  return {
    sourceUrl: !isSafeHttpUrl(form?.sourceUrl || ""),
    originalDescription: !asOptionalText(form?.originalDescription),
    title: !asOptionalText(form?.title),
    company: !asOptionalText(form?.company),
  };
}

export function draftFailureText(draft) {
  const reason = typeof draft?.failureReason === "string" ? draft.failureReason.trim() : "";
  if (reason) return reason;
  const category = typeof draft?.failureCategory === "string" ? draft.failureCategory.trim() : "";
  return JOB_DRAFT_FAILURE_LABELS[category] || "";
}

export function parseDraftFieldErrors(message) {
  if (!message || typeof message !== "string") return {};
  const errors = {};
  message.split(",").forEach((part) => {
    const trimmed = part.trim();
    const colon = trimmed.indexOf(":");
    if (colon === -1) return;
    const field = trimmed.slice(0, colon).trim();
    const text = trimmed.slice(colon + 1).trim();
    if (!field || !text) return;
    errors[field] = text;
  });
  return errors;
}

export function scoreInputError(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (parseResumeToJobScore(text) == null) return "Score must be a whole number from 0 to 100.";
  return null;
}
