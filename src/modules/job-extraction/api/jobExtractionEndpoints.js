export const JOB_EXTRACTION_BASE_PATH = "/api/v1/job-extraction";
export const AUTOMATED_JOB_EXTRACTION_BASE_PATH = "/api/v1/automated-job-extraction";

export const JOB_EXTRACTION_ENDPOINTS = Object.freeze({
  PARSE: `${JOB_EXTRACTION_BASE_PATH}/parse`,
  AUTOMATED_PARSE: `${AUTOMATED_JOB_EXTRACTION_BASE_PATH}/parse`,
});

export default JOB_EXTRACTION_ENDPOINTS;
