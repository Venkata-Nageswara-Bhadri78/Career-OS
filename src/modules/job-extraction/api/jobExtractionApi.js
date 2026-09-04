import JOB_EXTRACTION_ENDPOINTS from "./jobExtractionEndpoints";
import { post } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";
import { PARSE_TIMEOUT_MS } from "../config/jobExtractionConfig";

export const extractJobInfo = async ({ sourceUrl, rawJobText }) =>
  unwrapApiResponse(
    await post(JOB_EXTRACTION_ENDPOINTS.PARSE, { sourceUrl, rawJobText }, { timeout: PARSE_TIMEOUT_MS })
  );

const jobExtractionApi = { extractJobInfo };

export default jobExtractionApi;
