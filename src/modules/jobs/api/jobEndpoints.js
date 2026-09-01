const RAW_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export const API_BASE_URL = RAW_URL.replace(/\/api\/v1\/.*$/, "").replace(/\/$/, "");
export const JOB_BASE_PATH = "/api/v1/jobs";

export const JOB_ENDPOINTS = Object.freeze({
  BASE: JOB_BASE_PATH,
  BY_ID: (id) => `${JOB_BASE_PATH}/${id}`,
  LOCATION: (id) => `${JOB_BASE_PATH}/${id}/location`,
  TITLE: (id) => `${JOB_BASE_PATH}/${id}/title`,
  COMPANY: (id) => `${JOB_BASE_PATH}/${id}/company`,
  EMPLOYMENT_TYPE: (id) => `${JOB_BASE_PATH}/${id}/employment-type`,
  WORK_MODE: (id) => `${JOB_BASE_PATH}/${id}/work-mode`,
  EXPERIENCE: (id) => `${JOB_BASE_PATH}/${id}/experience`,
  SALARY: (id) => `${JOB_BASE_PATH}/${id}/salary`,
  EDUCATION: (id) => `${JOB_BASE_PATH}/${id}/education`,
  DEPARTMENT: (id) => `${JOB_BASE_PATH}/${id}/department`,
  INDUSTRY: (id) => `${JOB_BASE_PATH}/${id}/industry`,
  SOURCE_PLATFORM: (id) => `${JOB_BASE_PATH}/${id}/source-platform`,
  SOURCE_URL: (id) => `${JOB_BASE_PATH}/${id}/source-url`,
  SKILLS: (id) => `${JOB_BASE_PATH}/${id}/skills`,
  DESCRIPTION: (id) => `${JOB_BASE_PATH}/${id}/description`,
  ORIGINAL_DESCRIPTION: (id) => `${JOB_BASE_PATH}/${id}/original-description`,
});

export default JOB_ENDPOINTS;
