import JOB_EXTRACTION_ENDPOINTS from "./jobExtractionEndpoints";
import { post } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";
import { PARSE_TIMEOUT_MS } from "../config/jobExtractionConfig";

function positiveResumeId(resume) {
  const id = Number(resume);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function buildBody({ sourceUrl, rawJobText, resume, isAuto, includeText }) {
  const body = {
    sourceUrl,
    isAuto: isAuto === true,
  };
  if (includeText) body.rawJobText = rawJobText;
  const resumeId = positiveResumeId(resume);
  if (resumeId) body.resume = resumeId;
  return body;
}

async function parseEnvelope(endpoint, body) {
  const envelope = await post(endpoint, body, { timeout: PARSE_TIMEOUT_MS });
  return {
    message: typeof envelope?.message === "string" ? envelope.message : "",
    data: unwrapApiResponse(envelope),
  };
}

export const extractJobInfo = async ({ sourceUrl, rawJobText, resume, isAuto }) =>
  parseEnvelope(
    JOB_EXTRACTION_ENDPOINTS.PARSE,
    buildBody({ sourceUrl, rawJobText, resume, isAuto, includeText: true })
  );

export const extractJobFromUrl = async ({ sourceUrl, resume, isAuto }) =>
  parseEnvelope(
    JOB_EXTRACTION_ENDPOINTS.AUTOMATED_PARSE,
    buildBody({ sourceUrl, resume, isAuto, includeText: false })
  );

const jobExtractionApi = { extractJobInfo, extractJobFromUrl };

export default jobExtractionApi;
