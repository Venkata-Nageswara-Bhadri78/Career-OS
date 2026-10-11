import { joinJobSkills } from "../utils/formatters";

function asJobSkillsString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return joinJobSkills(value);
  return fallback;
}

function asDisplayText(value) {
  if (value == null) return value;
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return value;
}

function pickText(record, keys) {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
    const value = asDisplayText(record[key]);
    if (typeof value === "string") return value;
  }
  return undefined;
}

/**
 * Normalize a job payload from GET/PATCH so detail fields are always on the camelCase keys the UI reads.
 * @param {unknown} job
 */
export function normalizeJob(job) {
  if (!job || typeof job !== "object") return job;
  const education = pickText(job, ["education", "jobEducation", "requiredEducation"]);
  const department = pickText(job, ["department", "jobDepartment", "dept"]);
  const industry = pickText(job, ["industry", "jobIndustry"]);
  const sourcePlatform = pickText(job, ["sourcePlatform", "source_platform"]);
  return {
    ...job,
    ...("skills" in job
      ? { skills: typeof job.skills === "string" ? job.skills : joinJobSkills(job.skills) }
      : {}),
    ...(education !== undefined ? { education } : {}),
    ...(department !== undefined ? { department } : {}),
    ...(industry !== undefined ? { industry } : {}),
    ...(sourcePlatform !== undefined ? { sourcePlatform } : {}),
  };
}

/**
 * Merge a job update response into the current job without dropping detail fields
 * (education, department, industry, descriptions, etc.).
 * @param {import("../types/jobTypes").JobSummary} existing
 * @param {import("../types/jobTypes").Job} updated
 */
export function mergeJobSummary(existing, updated) {
  if (!updated || typeof updated !== "object") return existing;
  const base = existing && typeof existing === "object" ? existing : {};
  const incoming = normalizeJob(updated);
  const next = { ...base };

  Object.entries(incoming).forEach(([key, value]) => {
    if (value === undefined) return;
    next[key] = value;
  });

  if (base.id && !next.id) next.id = base.id;
  if (Object.prototype.hasOwnProperty.call(incoming, "skills")) {
    next.skills = asJobSkillsString(incoming.skills, "");
  } else if (base.skills != null) {
    next.skills = asJobSkillsString(base.skills, "");
  }
  return next;
}

/**
 * @param {import("../types/jobTypes").JobSummary[]} jobs
 * @param {{ workMode?: string, employmentType?: string }} filters
 */
export function applyClientFilters(jobs, filters) {
  let result = jobs;
  if (filters.workMode && filters.workMode !== "all") {
    const target = filters.workMode.toLowerCase();
    result = result.filter((job) => (job.workMode || "").toLowerCase().includes(target));
  }
  if (filters.employmentType && filters.employmentType !== "all") {
    const target = filters.employmentType.toLowerCase();
    result = result.filter((job) => (job.employmentType || "").toLowerCase().includes(target));
  }
  return result;
}

/**
 * @param {import("../types/jobTypes").JobSummary[]} jobs
 * @param {number} page
 * @param {number} size
 */
export function paginateClient(jobs, page, size) {
  const totalElements = jobs.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = safePage * size;
  return {
    content: jobs.slice(start, start + size),
    totalElements,
    totalPages,
    number: safePage,
    size,
  };
}
