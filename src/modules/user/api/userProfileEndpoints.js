import { API_BASE_URL } from "../../auth/api/authEndpoints";

export const USER_PROFILE_BASE_PATH = "/api/v1/users/profile";
export const USER_RESUMES_BASE_PATH = "/api/v1/users/resumes";

export const USER_PROFILE_ENDPOINTS = Object.freeze({
    PROFILE: USER_PROFILE_BASE_PATH,
    EXPERIENCES: `${USER_PROFILE_BASE_PATH}/experiences`,
    EDUCATIONS: `${USER_PROFILE_BASE_PATH}/educations`,
    PROJECTS: `${USER_PROFILE_BASE_PATH}/projects`,
    ADDITIONAL_INFO: `${USER_PROFILE_BASE_PATH}/additional-info`,
    LINKS: `${USER_PROFILE_BASE_PATH}/links`,
    RESUMES: USER_RESUMES_BASE_PATH,
});

export const buildProfileApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
export default USER_PROFILE_ENDPOINTS;
