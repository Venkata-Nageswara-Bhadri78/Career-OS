/**
 * Merge a full job update response into list-row shape.
 * @param {import("../types/jobTypes").JobSummary} existing
 * @param {import("../types/jobTypes").Job} updated
 */
export function mergeJobSummary(existing, updated) {
  if (!updated?.id) return existing;
  return {
    ...existing,
    id: updated.id,
    title: updated.title ?? existing?.title,
    company: updated.company ?? existing?.company,
    location: updated.location ?? existing?.location,
    employmentType: updated.employmentType ?? existing?.employmentType,
    workMode: updated.workMode ?? existing?.workMode,
    experience: updated.experience ?? existing?.experience,
    salary: updated.salary ?? existing?.salary,
    sourcePlatform: updated.sourcePlatform ?? existing?.sourcePlatform,
    skills: Array.isArray(updated.skills) ? updated.skills : existing?.skills ?? [],
    createdAt: updated.createdAt ?? existing?.createdAt,
  };
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
