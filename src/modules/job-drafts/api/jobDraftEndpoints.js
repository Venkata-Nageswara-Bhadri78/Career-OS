export const JOB_DRAFT_BASE_PATH = "/api/v1/job-drafts";

export const JOB_DRAFT_ENDPOINTS = Object.freeze({
  BASE: JOB_DRAFT_BASE_PATH,
  BY_ID: (id) => `${JOB_DRAFT_BASE_PATH}/${id}`,
  SAVE: (id) => `${JOB_DRAFT_BASE_PATH}/${id}/save`,
});

export default JOB_DRAFT_ENDPOINTS;
