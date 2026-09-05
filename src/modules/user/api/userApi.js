import { ApiError, CLIENT_COPY } from "../../../common/api/apiError";
import { del, download, get, patch, post, put, upload } from "../../../common/api/httpClient";
import { unwrapApiResponse } from "../../../common/api/unwrapApiResponse";
import { USER_TIMEOUTS } from "../config/userConfig";
import {
  mapAdditionalInfo,
  mapEducation,
  mapParseStatus,
  mapProfile,
  mapProfileLink,
  mapProject,
  mapResumeList,
  mapResumeUpload,
  mapWorkExperience,
} from "../mappers/userMapper";
import { asPositiveInt, parseContentDispositionFilename } from "../utils/formatters";
import USER_ENDPOINTS from "./userEndpoints";

function requireId(id, label = "Record") {
  const parsed = asPositiveInt(id);
  if (!parsed) {
    throw new ApiError({ message: `${label} not found.`, status: 404, data: null });
  }
  return parsed;
}

export async function getProfile(options = {}) {
  return mapProfile(unwrapApiResponse(await get(USER_ENDPOINTS.PROFILE, {}, options)));
}

export async function createProfile(body = {}, options = {}) {
  return mapProfile(unwrapApiResponse(await post(USER_ENDPOINTS.PROFILE, body, options)));
}

export async function updateProfile(body, options = {}) {
  return mapProfile(unwrapApiResponse(await put(USER_ENDPOINTS.PROFILE, body, options)));
}

export async function deleteProfile(options = {}) {
  return unwrapApiResponse(await del(USER_ENDPOINTS.PROFILE, options));
}

function mapList(payload, mapper) {
  return (Array.isArray(payload) ? payload : []).map(mapper).filter(Boolean);
}

export async function listExperiences(options = {}) {
  return mapList(unwrapApiResponse(await get(USER_ENDPOINTS.EXPERIENCES, {}, options)), mapWorkExperience);
}

export async function addExperience(body, options = {}) {
  return mapWorkExperience(unwrapApiResponse(await post(USER_ENDPOINTS.EXPERIENCES, body, options)));
}

export async function updateExperience(id, body, options = {}) {
  return mapWorkExperience(
    unwrapApiResponse(await put(USER_ENDPOINTS.EXPERIENCE_BY_ID(requireId(id, "Work experience")), body, options))
  );
}

export async function deleteExperience(id, options = {}) {
  return unwrapApiResponse(await del(USER_ENDPOINTS.EXPERIENCE_BY_ID(requireId(id, "Work experience")), options));
}

export async function listEducations(options = {}) {
  return mapList(unwrapApiResponse(await get(USER_ENDPOINTS.EDUCATIONS, {}, options)), mapEducation);
}

export async function addEducation(body, options = {}) {
  return mapEducation(unwrapApiResponse(await post(USER_ENDPOINTS.EDUCATIONS, body, options)));
}

export async function updateEducation(id, body, options = {}) {
  return mapEducation(
    unwrapApiResponse(await put(USER_ENDPOINTS.EDUCATION_BY_ID(requireId(id, "Education record")), body, options))
  );
}

export async function deleteEducation(id, options = {}) {
  return unwrapApiResponse(await del(USER_ENDPOINTS.EDUCATION_BY_ID(requireId(id, "Education record")), options));
}

export async function listProjects(options = {}) {
  return mapList(unwrapApiResponse(await get(USER_ENDPOINTS.PROJECTS, {}, options)), mapProject);
}

export async function addProject(body, options = {}) {
  return mapProject(unwrapApiResponse(await post(USER_ENDPOINTS.PROJECTS, body, options)));
}

export async function updateProject(id, body, options = {}) {
  return mapProject(unwrapApiResponse(await put(USER_ENDPOINTS.PROJECT_BY_ID(requireId(id, "Project")), body, options)));
}

export async function deleteProject(id, options = {}) {
  return unwrapApiResponse(await del(USER_ENDPOINTS.PROJECT_BY_ID(requireId(id, "Project")), options));
}

export async function listAdditionalInfo(options = {}) {
  return mapList(unwrapApiResponse(await get(USER_ENDPOINTS.ADDITIONAL_INFO, {}, options)), mapAdditionalInfo);
}

export async function addAdditionalInfo(body, options = {}) {
  return mapAdditionalInfo(unwrapApiResponse(await post(USER_ENDPOINTS.ADDITIONAL_INFO, body, options)));
}

export async function updateAdditionalInfo(id, body, options = {}) {
  return mapAdditionalInfo(
    unwrapApiResponse(
      await put(USER_ENDPOINTS.ADDITIONAL_INFO_BY_ID(requireId(id, "Additional profile information")), body, options)
    )
  );
}

export async function deleteAdditionalInfo(id, options = {}) {
  return unwrapApiResponse(
    await del(USER_ENDPOINTS.ADDITIONAL_INFO_BY_ID(requireId(id, "Additional profile information")), options)
  );
}

export async function listLinks(options = {}) {
  return mapList(unwrapApiResponse(await get(USER_ENDPOINTS.LINKS, {}, options)), mapProfileLink);
}

export async function addLink(body, options = {}) {
  return mapProfileLink(unwrapApiResponse(await post(USER_ENDPOINTS.LINKS, body, options)));
}

export async function updateLink(id, body, options = {}) {
  return mapProfileLink(
    unwrapApiResponse(await put(USER_ENDPOINTS.LINK_BY_ID(requireId(id, "Profile link")), body, options))
  );
}

export async function deleteLink(id, options = {}) {
  return unwrapApiResponse(await del(USER_ENDPOINTS.LINK_BY_ID(requireId(id, "Profile link")), options));
}

export async function listResumes(options = {}) {
  return mapResumeList(unwrapApiResponse(await get(USER_ENDPOINTS.RESUMES, {}, options)));
}

export async function uploadResume(file, options = {}) {
  const formData = new FormData();
  formData.append("file", file);
  return mapResumeUpload(
    unwrapApiResponse(
      await upload(USER_ENDPOINTS.RESUMES, formData, { timeout: USER_TIMEOUTS.UPLOAD_MS, ...options })
    )
  );
}

export async function deleteResume(id, options = {}) {
  return unwrapApiResponse(await del(USER_ENDPOINTS.RESUME_BY_ID(requireId(id, "Resume")), options));
}

export async function setPrimaryResume(id, options = {}) {
  return unwrapApiResponse(await patch(USER_ENDPOINTS.RESUME_PRIMARY(requireId(id, "Resume")), null, options));
}

export async function downloadResume(id, options = {}) {
  const response = await download(USER_ENDPOINTS.RESUME_BY_ID(requireId(id, "Resume")), {
    timeout: USER_TIMEOUTS.DOWNLOAD_MS,
    ...options,
  });
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);
    throw new ApiError({
      message: typeof data?.message === "string" && data.message.trim() ? data.message : CLIENT_COPY.generic,
      status: response.status,
      data,
    });
  }
  const blob = await response.blob();
  return {
    blob,
    filename: parseContentDispositionFilename(response.headers.get("content-disposition")) || "resume.pdf",
    contentType,
  };
}

export async function getResumeParseStatus(options = {}) {
  try {
    unwrapApiResponse(await get(USER_ENDPOINTS.RESUME_CONTEXT, {}, options));
    return mapParseStatus(null);
  } catch (err) {
    return mapParseStatus(err);
  }
}

const userApi = {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  listExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  listEducations,
  addEducation,
  updateEducation,
  deleteEducation,
  listProjects,
  addProject,
  updateProject,
  deleteProject,
  listAdditionalInfo,
  addAdditionalInfo,
  updateAdditionalInfo,
  deleteAdditionalInfo,
  listLinks,
  addLink,
  updateLink,
  deleteLink,
  listResumes,
  uploadResume,
  deleteResume,
  setPrimaryResume,
  downloadResume,
  getResumeParseStatus,
};

export default userApi;
