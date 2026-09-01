import apiClient from "../../auth/api/apiClient";
import USER_PROFILE_ENDPOINTS from "./userProfileEndpoints";

// Helper to extract data or return default for lists
const extractDataOrDefault = (res, defaultVal = null) => res?.data ?? defaultVal;

const UserProfileApi = {
    // --- Profile ---
    getProfile: async () => {
        const res = await apiClient.protectedRequest({
            endpoint: USER_PROFILE_ENDPOINTS.PROFILE,
            method: "GET"
        });
        return extractDataOrDefault(res);
    },
    createProfile: async (data) => {
        const res = await apiClient.protectedRequest({
            endpoint: USER_PROFILE_ENDPOINTS.PROFILE,
            method: "POST",
            body: data
        });
        return extractDataOrDefault(res);
    },
    updateProfile: async (data) => {
        const res = await apiClient.protectedRequest({
            endpoint: USER_PROFILE_ENDPOINTS.PROFILE,
            method: "PUT",
            body: data
        });
        return extractDataOrDefault(res);
    },
    deleteProfile: async () => {
        const res = await apiClient.protectedRequest({
            endpoint: USER_PROFILE_ENDPOINTS.PROFILE,
            method: "DELETE"
        });
        return extractDataOrDefault(res);
    },

    // --- Work Experience ---
    getExperiences: async () => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.EXPERIENCES, method: "GET" });
        return extractDataOrDefault(res, []);
    },
    addExperience: async (data) => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.EXPERIENCES, method: "POST", body: data });
        return extractDataOrDefault(res);
    },
    updateExperience: async (id, data) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.EXPERIENCES}/${id}`, method: "PUT", body: data });
        return extractDataOrDefault(res);
    },
    deleteExperience: async (id) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.EXPERIENCES}/${id}`, method: "DELETE" });
        return extractDataOrDefault(res);
    },

    // --- Education ---
    getEducations: async () => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.EDUCATIONS, method: "GET" });
        return extractDataOrDefault(res, []);
    },
    addEducation: async (data) => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.EDUCATIONS, method: "POST", body: data });
        return extractDataOrDefault(res);
    },
    updateEducation: async (id, data) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.EDUCATIONS}/${id}`, method: "PUT", body: data });
        return extractDataOrDefault(res);
    },
    deleteEducation: async (id) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.EDUCATIONS}/${id}`, method: "DELETE" });
        return extractDataOrDefault(res);
    },

    // --- Projects ---
    getProjects: async () => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.PROJECTS, method: "GET" });
        return extractDataOrDefault(res, []);
    },
    addProject: async (data) => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.PROJECTS, method: "POST", body: data });
        return extractDataOrDefault(res);
    },
    updateProject: async (id, data) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.PROJECTS}/${id}`, method: "PUT", body: data });
        return extractDataOrDefault(res);
    },
    deleteProject: async (id) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.PROJECTS}/${id}`, method: "DELETE" });
        return extractDataOrDefault(res);
    },

    // --- Additional Information ---
    getAdditionalInfos: async () => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.ADDITIONAL_INFO, method: "GET" });
        return extractDataOrDefault(res, []);
    },
    addAdditionalInfo: async (data) => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.ADDITIONAL_INFO, method: "POST", body: data });
        return extractDataOrDefault(res);
    },
    updateAdditionalInfo: async (id, data) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.ADDITIONAL_INFO}/${id}`, method: "PUT", body: data });
        return extractDataOrDefault(res);
    },
    deleteAdditionalInfo: async (id) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.ADDITIONAL_INFO}/${id}`, method: "DELETE" });
        return extractDataOrDefault(res);
    },

    // --- Profile Links ---
    getLinks: async () => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.LINKS, method: "GET" });
        return extractDataOrDefault(res, []);
    },
    addLink: async (data) => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.LINKS, method: "POST", body: data });
        return extractDataOrDefault(res);
    },
    updateLink: async (id, data) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.LINKS}/${id}`, method: "PUT", body: data });
        return extractDataOrDefault(res);
    },
    deleteLink: async (id) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.LINKS}/${id}`, method: "DELETE" });
        return extractDataOrDefault(res);
    },

    // --- Resumes ---
    getResumes: async () => {
        const res = await apiClient.protectedRequest({ endpoint: USER_PROFILE_ENDPOINTS.RESUMES, method: "GET" });
        return extractDataOrDefault(res, []);
    },
    uploadResume: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiClient.upload(USER_PROFILE_ENDPOINTS.RESUMES, formData);
        return extractDataOrDefault(res);
    },
    deleteResume: async (id) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.RESUMES}/${id}`, method: "DELETE" });
        return extractDataOrDefault(res);
    },
    setHighPriorityResume: async (id) => {
        const res = await apiClient.protectedRequest({ endpoint: `${USER_PROFILE_ENDPOINTS.RESUMES}/${id}/high-priority`, method: "PATCH" });
        return extractDataOrDefault(res);
    },
    downloadResumeUrl: (id) => {
        // We will call apiClient.download which returns a Response object, 
        // or just construct the URL and let the browser handle downloading using the token.
        // Wait, apiClient.download uses fetch with the token.
        // So we can do this:
        return apiClient.buildUrl(`${USER_PROFILE_ENDPOINTS.RESUMES}/${id}`);
    },
    downloadResumeFetch: async (id) => {
        return await apiClient.download(`${USER_PROFILE_ENDPOINTS.RESUMES}/${id}`);
    }
};

export default UserProfileApi;
