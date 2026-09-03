import USER_PROFILE_ENDPOINTS from "./userProfileEndpoints";
import { buildUrl, del, download, get, patch, post, put, upload } from "../../../common/api/httpClient";

const extractDataOrDefault = (res, defaultVal = null) => res?.data ?? defaultVal;

const UserProfileApi = {
  getProfile: async () => extractDataOrDefault(await get(USER_PROFILE_ENDPOINTS.PROFILE)),
  createProfile: async (data) => extractDataOrDefault(await post(USER_PROFILE_ENDPOINTS.PROFILE, data)),
  updateProfile: async (data) => extractDataOrDefault(await put(USER_PROFILE_ENDPOINTS.PROFILE, data)),
  deleteProfile: async () => extractDataOrDefault(await del(USER_PROFILE_ENDPOINTS.PROFILE)),

  getExperiences: async () => extractDataOrDefault(await get(USER_PROFILE_ENDPOINTS.EXPERIENCES), []),
  addExperience: async (data) => extractDataOrDefault(await post(USER_PROFILE_ENDPOINTS.EXPERIENCES, data)),
  updateExperience: async (id, data) =>
    extractDataOrDefault(await put(`${USER_PROFILE_ENDPOINTS.EXPERIENCES}/${id}`, data)),
  deleteExperience: async (id) => extractDataOrDefault(await del(`${USER_PROFILE_ENDPOINTS.EXPERIENCES}/${id}`)),

  getEducations: async () => extractDataOrDefault(await get(USER_PROFILE_ENDPOINTS.EDUCATIONS), []),
  addEducation: async (data) => extractDataOrDefault(await post(USER_PROFILE_ENDPOINTS.EDUCATIONS, data)),
  updateEducation: async (id, data) =>
    extractDataOrDefault(await put(`${USER_PROFILE_ENDPOINTS.EDUCATIONS}/${id}`, data)),
  deleteEducation: async (id) => extractDataOrDefault(await del(`${USER_PROFILE_ENDPOINTS.EDUCATIONS}/${id}`)),

  getProjects: async () => extractDataOrDefault(await get(USER_PROFILE_ENDPOINTS.PROJECTS), []),
  addProject: async (data) => extractDataOrDefault(await post(USER_PROFILE_ENDPOINTS.PROJECTS, data)),
  updateProject: async (id, data) => extractDataOrDefault(await put(`${USER_PROFILE_ENDPOINTS.PROJECTS}/${id}`, data)),
  deleteProject: async (id) => extractDataOrDefault(await del(`${USER_PROFILE_ENDPOINTS.PROJECTS}/${id}`)),

  getAdditionalInfos: async () => extractDataOrDefault(await get(USER_PROFILE_ENDPOINTS.ADDITIONAL_INFO), []),
  addAdditionalInfo: async (data) => extractDataOrDefault(await post(USER_PROFILE_ENDPOINTS.ADDITIONAL_INFO, data)),
  updateAdditionalInfo: async (id, data) =>
    extractDataOrDefault(await put(`${USER_PROFILE_ENDPOINTS.ADDITIONAL_INFO}/${id}`, data)),
  deleteAdditionalInfo: async (id) => extractDataOrDefault(await del(`${USER_PROFILE_ENDPOINTS.ADDITIONAL_INFO}/${id}`)),

  getLinks: async () => extractDataOrDefault(await get(USER_PROFILE_ENDPOINTS.LINKS), []),
  addLink: async (data) => extractDataOrDefault(await post(USER_PROFILE_ENDPOINTS.LINKS, data)),
  updateLink: async (id, data) => extractDataOrDefault(await put(`${USER_PROFILE_ENDPOINTS.LINKS}/${id}`, data)),
  deleteLink: async (id) => extractDataOrDefault(await del(`${USER_PROFILE_ENDPOINTS.LINKS}/${id}`)),

  getResumes: async () => extractDataOrDefault(await get(USER_PROFILE_ENDPOINTS.RESUMES), []),
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return extractDataOrDefault(await upload(USER_PROFILE_ENDPOINTS.RESUMES, formData));
  },
  deleteResume: async (id) => extractDataOrDefault(await del(`${USER_PROFILE_ENDPOINTS.RESUMES}/${id}`)),
  setHighPriorityResume: async (id) =>
    extractDataOrDefault(await patch(`${USER_PROFILE_ENDPOINTS.RESUMES}/${id}/high-priority`)),
  downloadResumeUrl: (id) => buildUrl(`${USER_PROFILE_ENDPOINTS.RESUMES}/${id}`),
  downloadResumeFetch: async (id) => download(`${USER_PROFILE_ENDPOINTS.RESUMES}/${id}`),
};

export default UserProfileApi;
