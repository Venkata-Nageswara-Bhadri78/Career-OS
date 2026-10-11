import { ApiError } from "../../../common/api/apiError";
import JOB_ENDPOINTS from "./jobEndpoints";
import { get, post, put, patch, del } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";
import { parseJobStatus } from "../config/jobStatus";
import { joinJobSkills } from "../utils/formatters";
import { normalizeJob } from "../mappers/jobMapper";

function withSkillsString(jobData) {
  if (!jobData || typeof jobData !== "object" || !("skills" in jobData)) return jobData;
  const { skills } = jobData;
  return {
    ...jobData,
    skills: typeof skills === "string" ? skills : joinJobSkills(skills),
  };
}

function unwrapJob(envelope) {
  return normalizeJob(unwrapApiResponse(envelope));
}

function unwrapJobPage(envelope) {
  const page = unwrapApiResponse(envelope);
  if (!page || typeof page !== "object") return page;
  return {
    ...page,
    content: Array.isArray(page.content) ? page.content.map(normalizeJob) : page.content,
  };
}

export const createJob = async (jobData) => unwrapJob(await post(JOB_ENDPOINTS.BASE, withSkillsString(jobData)));
export const getJobs = async (params = {}) => unwrapJobPage(await get(JOB_ENDPOINTS.BASE, params));
export const getJobById = async (id) => unwrapJob(await get(JOB_ENDPOINTS.BY_ID(id)));
export const updateJob = async (id, jobData) => unwrapJob(await put(JOB_ENDPOINTS.BY_ID(id), withSkillsString(jobData)));
export const patchJob = async (id, partialData) => unwrapJob(await patch(JOB_ENDPOINTS.BY_ID(id), withSkillsString(partialData)));
export const deleteJob = async (id) => unwrapApiResponse(await del(JOB_ENDPOINTS.BY_ID(id)));

export const updateLocation = async (id, location) => unwrapJob(await patch(JOB_ENDPOINTS.LOCATION(id), { location }));
export const updateTitle = async (id, title) => unwrapJob(await patch(JOB_ENDPOINTS.TITLE(id), { title }));
export const updateCompany = async (id, company) => unwrapJob(await patch(JOB_ENDPOINTS.COMPANY(id), { company }));
export const updateEmploymentType = async (id, employmentType) => unwrapJob(await patch(JOB_ENDPOINTS.EMPLOYMENT_TYPE(id), { employmentType }));
export const updateWorkMode = async (id, workMode) => unwrapJob(await patch(JOB_ENDPOINTS.WORK_MODE(id), { workMode }));
export const updateExperience = async (id, experience) => unwrapJob(await patch(JOB_ENDPOINTS.EXPERIENCE(id), { experience }));
export const updateSalary = async (id, salary) => unwrapJob(await patch(JOB_ENDPOINTS.SALARY(id), { salary }));
export const updateEducation = async (id, education) => unwrapJob(await patch(JOB_ENDPOINTS.EDUCATION(id), { education }));
export const updateDepartment = async (id, department) => unwrapJob(await patch(JOB_ENDPOINTS.DEPARTMENT(id), { department }));
export const updateIndustry = async (id, industry) => unwrapJob(await patch(JOB_ENDPOINTS.INDUSTRY(id), { industry }));
export const updateSourcePlatform = async (id, sourcePlatform) => unwrapJob(await patch(JOB_ENDPOINTS.SOURCE_PLATFORM(id), { sourcePlatform }));
export const updateSourceUrl = async (id, sourceUrl) => unwrapJob(await patch(JOB_ENDPOINTS.SOURCE_URL(id), { sourceUrl }));
export const updateSkills = async (id, skills) =>
  unwrapJob(await patch(JOB_ENDPOINTS.SKILLS(id), { skills: joinJobSkills(skills) }));
export const updateDescription = async (id, description) => unwrapJob(await patch(JOB_ENDPOINTS.DESCRIPTION(id), { description }));
export const updateOriginalDescription = async (id, originalDescription) =>
  unwrapJob(await patch(JOB_ENDPOINTS.ORIGINAL_DESCRIPTION(id), { originalDescription }));

export const updateJobStatus = async (id, value) => {
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new ApiError({ message: "Job not found.", status: 404, data: null });
  }
  const source = value && typeof value === "object" ? value : { jobStatus: value };
  const jobStatus = parseJobStatus(source.jobStatus);
  if (!jobStatus) {
    throw new ApiError({ message: "Job status is required.", status: 400, data: null });
  }
  const body = { jobStatus };
  if (jobStatus === "CUSTOM") {
    const customStatus = typeof source.customStatus === "string" ? source.customStatus.trim() : "";
    if (!customStatus) {
      throw new ApiError({
        message: "Custom status text is required when jobStatus is CUSTOM.",
        status: 400,
        data: null,
      });
    }
    body.customStatus = customStatus;
  }
  return unwrapJob(await patch(JOB_ENDPOINTS.STATUS(jobId), body));
};

export const updateNotes = async (id, notes) =>
  unwrapJob(await patch(JOB_ENDPOINTS.NOTES(id), { notes: typeof notes === "string" ? notes : "" }));

const jobApi = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  patchJob,
  deleteJob,
  updateLocation,
  updateTitle,
  updateCompany,
  updateEmploymentType,
  updateWorkMode,
  updateExperience,
  updateSalary,
  updateEducation,
  updateDepartment,
  updateIndustry,
  updateSourcePlatform,
  updateSourceUrl,
  updateSkills,
  updateDescription,
  updateOriginalDescription,
  updateJobStatus,
  updateNotes,
};

export default jobApi;
