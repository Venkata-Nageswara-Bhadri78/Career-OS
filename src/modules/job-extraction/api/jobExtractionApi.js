import JOB_EXTRACTION_ENDPOINTS from "./jobExtractionEndpoints";
import { post } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";

export const extractJobInfo = async ({ sourceUrl, rawJobText }) =>
  unwrapApiResponse(await post(JOB_EXTRACTION_ENDPOINTS.PARSE, { sourceUrl, rawJobText }));

const jobExtractionApi = { extractJobInfo };

export default jobExtractionApi;
