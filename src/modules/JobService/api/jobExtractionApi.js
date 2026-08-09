import JOB_EXTRACTION_ENDPOINTS from "./jobExtractionEndpoints";
import { post } from "./jobClient";

const unwrap = (res) => {
  if (res && res.success === false) throw new Error(res.message || "API request failed");
  return res?.data !== undefined ? res.data : res;
};

export const extractJobInfo = async ({ sourceUrl, rawJobText }) =>
  unwrap(await post(JOB_EXTRACTION_ENDPOINTS.PARSE, { sourceUrl, rawJobText }));

const jobExtractionApi = { extractJobInfo };

export default jobExtractionApi;
