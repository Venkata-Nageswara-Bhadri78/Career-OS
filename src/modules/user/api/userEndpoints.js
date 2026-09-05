import { API_BASE_URL } from "../../../common/api/apiConfig";
import { USER_RELATED_ENDPOINTS } from "../config/userConfig";

export const USER_PROFILE_BASE_PATH = "/api/v1/users/profile";
export const USER_RESUMES_BASE_PATH = "/api/v1/users/resumes";

export const USER_ENDPOINTS = Object.freeze({
  PROFILE: USER_PROFILE_BASE_PATH,
  EXPERIENCES: `${USER_PROFILE_BASE_PATH}/experiences`,
  EXPERIENCE_BY_ID: (id) => `${USER_PROFILE_BASE_PATH}/experiences/${id}`,
  EDUCATIONS: `${USER_PROFILE_BASE_PATH}/educations`,
  EDUCATION_BY_ID: (id) => `${USER_PROFILE_BASE_PATH}/educations/${id}`,
  PROJECTS: `${USER_PROFILE_BASE_PATH}/projects`,
  PROJECT_BY_ID: (id) => `${USER_PROFILE_BASE_PATH}/projects/${id}`,
  ADDITIONAL_INFO: `${USER_PROFILE_BASE_PATH}/additional-info`,
  ADDITIONAL_INFO_BY_ID: (id) => `${USER_PROFILE_BASE_PATH}/additional-info/${id}`,
  LINKS: `${USER_PROFILE_BASE_PATH}/links`,
  LINK_BY_ID: (id) => `${USER_PROFILE_BASE_PATH}/links/${id}`,
  RESUMES: USER_RESUMES_BASE_PATH,
  RESUME_BY_ID: (id) => `${USER_RESUMES_BASE_PATH}/${id}`,
  RESUME_PRIMARY: (id) => `${USER_RESUMES_BASE_PATH}/${id}/high-priority`,
  RESUME_CONTEXT: USER_RELATED_ENDPOINTS.RESUME_CONTEXT,
});

export const buildUserApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export default USER_ENDPOINTS;
