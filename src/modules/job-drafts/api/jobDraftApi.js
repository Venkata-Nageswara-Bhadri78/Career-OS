import { ApiError, CLIENT_COPY } from "../../../common/api/apiError";
import { del, get, post, put } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";
import { mapJobDraft } from "../mappers/jobDraftMapper";
import JOB_DRAFT_ENDPOINTS from "./jobDraftEndpoints";

function requireDraftId(id) {
  const draftId = Number(id);
  if (!Number.isInteger(draftId) || draftId <= 0) {
    throw new ApiError({ message: "Job draft not found.", status: 404, data: null });
  }
  return draftId;
}

function mapPage(page, fallbackSize) {
  const content = Array.isArray(page?.content) ? page.content.map(mapJobDraft).filter(Boolean) : [];
  const totalElements = Number.isFinite(Number(page?.totalElements)) ? Number(page.totalElements) : content.length;
  const totalPages = Number.isFinite(Number(page?.totalPages)) ? Number(page.totalPages) : 0;
  const number = Number.isFinite(Number(page?.number)) ? Number(page.number) : 0;
  const size = Number.isFinite(Number(page?.size)) ? Number(page.size) : fallbackSize;
  return { content, totalElements, totalPages, number, size };
}

export async function listJobDrafts(params = {}, options = {}) {
  const page = unwrapApiResponse(await get(JOB_DRAFT_ENDPOINTS.BASE, params, options));
  return mapPage(page, params.size ?? 10);
}

export async function getJobDraft(id, options = {}) {
  const draftId = requireDraftId(id);
  const draft = mapJobDraft(unwrapApiResponse(await get(JOB_DRAFT_ENDPOINTS.BY_ID(draftId), {}, options)));
  if (!draft) {
    throw new ApiError({ message: "Job draft not found.", status: 404, data: null });
  }
  return draft;
}

export async function updateJobDraft(id, body, options = {}) {
  const draftId = requireDraftId(id);
  const draft = mapJobDraft(unwrapApiResponse(await put(JOB_DRAFT_ENDPOINTS.BY_ID(draftId), body, options)));
  if (!draft) {
    throw new ApiError({
      message: CLIENT_COPY.generic,
      status: 500,
      data: null,
    });
  }
  return draft;
}

export async function saveJobDraft(id, options = {}) {
  const draftId = requireDraftId(id);
  return unwrapApiResponse(await post(JOB_DRAFT_ENDPOINTS.SAVE(draftId), undefined, options));
}

export async function deleteJobDraft(id, options = {}) {
  const draftId = requireDraftId(id);
  return unwrapApiResponse(await del(JOB_DRAFT_ENDPOINTS.BY_ID(draftId), options));
}

const jobDraftApi = {
  listJobDrafts,
  getJobDraft,
  updateJobDraft,
  saveJobDraft,
  deleteJobDraft,
};

export default jobDraftApi;
