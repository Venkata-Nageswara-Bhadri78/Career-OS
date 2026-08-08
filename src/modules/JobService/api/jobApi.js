import JOB_ENDPOINTS from "./jobEndpoints";
import { get, post, put, patch, del } from "./jobClient";

const unwrap = (res) => {
  if (res && res.success === false) throw new Error(res.message || "API request failed");
  return res?.data !== undefined ? res.data : res;
};

export const createJob = async (jobData) => unwrap(await post(JOB_ENDPOINTS.BASE, jobData));
export const getJobs = async (params = {}) => unwrap(await get(JOB_ENDPOINTS.BASE, params));
export const getJobById = async (id) => unwrap(await get(JOB_ENDPOINTS.BY_ID(id)));
export const updateJob = async (id, jobData) => unwrap(await put(JOB_ENDPOINTS.BY_ID(id), jobData));
export const patchJob = async (id, partialData) => unwrap(await patch(JOB_ENDPOINTS.BY_ID(id), partialData));
export const deleteJob = async (id) => unwrap(await del(JOB_ENDPOINTS.BY_ID(id)));

export const updateLocation = async (id, location) => unwrap(await patch(JOB_ENDPOINTS.LOCATION(id), { location }));
export const updateTitle = async (id, title) => unwrap(await patch(JOB_ENDPOINTS.TITLE(id), { title }));
export const updateCompany = async (id, company) => unwrap(await patch(JOB_ENDPOINTS.COMPANY(id), { company }));
export const updateEmploymentType = async (id, employmentType) => unwrap(await patch(JOB_ENDPOINTS.EMPLOYMENT_TYPE(id), { employmentType }));
export const updateWorkMode = async (id, workMode) => unwrap(await patch(JOB_ENDPOINTS.WORK_MODE(id), { workMode }));
export const updateExperience = async (id, experience) => unwrap(await patch(JOB_ENDPOINTS.EXPERIENCE(id), { experience }));
export const updateSalary = async (id, salary) => unwrap(await patch(JOB_ENDPOINTS.SALARY(id), { salary }));
export const updateEducation = async (id, education) => unwrap(await patch(JOB_ENDPOINTS.EDUCATION(id), { education }));
export const updateDepartment = async (id, department) => unwrap(await patch(JOB_ENDPOINTS.DEPARTMENT(id), { department }));
export const updateIndustry = async (id, industry) => unwrap(await patch(JOB_ENDPOINTS.INDUSTRY(id), { industry }));
export const updateSourcePlatform = async (id, sourcePlatform) => unwrap(await patch(JOB_ENDPOINTS.SOURCE_PLATFORM(id), { sourcePlatform }));
export const updateSourceUrl = async (id, sourceUrl) => unwrap(await patch(JOB_ENDPOINTS.SOURCE_URL(id), { sourceUrl }));
export const updateSkills = async (id, skills) => unwrap(await patch(JOB_ENDPOINTS.SKILLS(id), { skills }));
export const updateDescription = async (id, description) => unwrap(await patch(JOB_ENDPOINTS.DESCRIPTION(id), { description }));
export const updateOriginalDescription = async (id, originalDescription) => unwrap(await patch(JOB_ENDPOINTS.ORIGINAL_DESCRIPTION(id), { originalDescription }));

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
};

export default jobApi;
