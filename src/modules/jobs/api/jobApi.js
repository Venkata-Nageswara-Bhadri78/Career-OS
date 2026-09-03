import JOB_ENDPOINTS from "./jobEndpoints";
import { get, post, put, patch, del } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";

export const createJob = async (jobData) => unwrapApiResponse(await post(JOB_ENDPOINTS.BASE, jobData));
export const getJobs = async (params = {}) => unwrapApiResponse(await get(JOB_ENDPOINTS.BASE, params));
export const getJobById = async (id) => unwrapApiResponse(await get(JOB_ENDPOINTS.BY_ID(id)));
export const updateJob = async (id, jobData) => unwrapApiResponse(await put(JOB_ENDPOINTS.BY_ID(id), jobData));
export const patchJob = async (id, partialData) => unwrapApiResponse(await patch(JOB_ENDPOINTS.BY_ID(id), partialData));
export const deleteJob = async (id) => unwrapApiResponse(await del(JOB_ENDPOINTS.BY_ID(id)));

export const updateLocation = async (id, location) => unwrapApiResponse(await patch(JOB_ENDPOINTS.LOCATION(id), { location }));
export const updateTitle = async (id, title) => unwrapApiResponse(await patch(JOB_ENDPOINTS.TITLE(id), { title }));
export const updateCompany = async (id, company) => unwrapApiResponse(await patch(JOB_ENDPOINTS.COMPANY(id), { company }));
export const updateEmploymentType = async (id, employmentType) => unwrapApiResponse(await patch(JOB_ENDPOINTS.EMPLOYMENT_TYPE(id), { employmentType }));
export const updateWorkMode = async (id, workMode) => unwrapApiResponse(await patch(JOB_ENDPOINTS.WORK_MODE(id), { workMode }));
export const updateExperience = async (id, experience) => unwrapApiResponse(await patch(JOB_ENDPOINTS.EXPERIENCE(id), { experience }));
export const updateSalary = async (id, salary) => unwrapApiResponse(await patch(JOB_ENDPOINTS.SALARY(id), { salary }));
export const updateEducation = async (id, education) => unwrapApiResponse(await patch(JOB_ENDPOINTS.EDUCATION(id), { education }));
export const updateDepartment = async (id, department) => unwrapApiResponse(await patch(JOB_ENDPOINTS.DEPARTMENT(id), { department }));
export const updateIndustry = async (id, industry) => unwrapApiResponse(await patch(JOB_ENDPOINTS.INDUSTRY(id), { industry }));
export const updateSourcePlatform = async (id, sourcePlatform) => unwrapApiResponse(await patch(JOB_ENDPOINTS.SOURCE_PLATFORM(id), { sourcePlatform }));
export const updateSourceUrl = async (id, sourceUrl) => unwrapApiResponse(await patch(JOB_ENDPOINTS.SOURCE_URL(id), { sourceUrl }));
export const updateSkills = async (id, skills) => unwrapApiResponse(await patch(JOB_ENDPOINTS.SKILLS(id), { skills }));
export const updateDescription = async (id, description) => unwrapApiResponse(await patch(JOB_ENDPOINTS.DESCRIPTION(id), { description }));
export const updateOriginalDescription = async (id, originalDescription) => unwrapApiResponse(await patch(JOB_ENDPOINTS.ORIGINAL_DESCRIPTION(id), { originalDescription }));

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
