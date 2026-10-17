import { COMMUNITY_LIMITS } from "../config/communityConstants";

const HTTP_URL = /^https?:\/\//i;

export function emptyCommunityForm() {
  return {
    title: "",
    company: "",
    location: "",
    description: "",
    sourceUrl: "",
    alternativeUrls: [],
  };
}

export function formFromPrefill(prefill) {
  return {
    title: prefill?.title ?? "",
    company: prefill?.company ?? "",
    location: prefill?.location ?? "",
    description: prefill?.description ?? "",
    sourceUrl: prefill?.sourceUrl ?? "",
    alternativeUrls: [],
  };
}

export function isAbsoluteHttpUrl(value) {
  const text = String(value ?? "").trim();
  if (!text || !HTTP_URL.test(text)) return false;
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function urlError(value, { required = false } = {}) {
  const text = String(value ?? "").trim();
  if (!text) return required ? "Posting URL is required." : "Alternative posting URL cannot be blank.";
  if (text.length > COMMUNITY_LIMITS.URL_MAX) return "Posting URL cannot exceed 2000 characters.";
  if (!isAbsoluteHttpUrl(text)) return "Job URL must be a valid absolute http or https link.";
  return "";
}

export function validateCommunityUrls(form) {
  const errors = {};
  const source = urlError(form?.sourceUrl, { required: true });
  if (source) errors.sourceUrl = source;
  const alternatives = Array.isArray(form?.alternativeUrls) ? form.alternativeUrls : [];
  alternatives.forEach((url, index) => {
    const message = urlError(url);
    if (message) errors[`alternativeUrls[${index}]`] = message;
  });
  return errors;
}

export function validateCommunityCreate(form) {
  const errors = validateCommunityUrls(form);
  const title = String(form?.title ?? "").trim();
  const company = String(form?.company ?? "").trim();
  const location = String(form?.location ?? "").trim();
  const description = String(form?.description ?? "").trim();

  if (!title) errors.title = "Title is required.";
  else if (title.length > COMMUNITY_LIMITS.TITLE_MAX) errors.title = "Title cannot exceed 255 characters.";

  if (!company) errors.company = "Company is required.";
  else if (company.length > COMMUNITY_LIMITS.COMPANY_MAX) errors.company = "Company cannot exceed 255 characters.";

  if (location.length > COMMUNITY_LIMITS.LOCATION_MAX) errors.location = "Location cannot exceed 255 characters.";

  if (!description) errors.description = "Description is required.";
  else if (description.length > COMMUNITY_LIMITS.DESCRIPTION_MAX) {
    errors.description = "Description cannot exceed 50000 characters.";
  }

  return errors;
}

export function collectCommunityUrls(form) {
  const source = String(form?.sourceUrl ?? "").trim();
  const alternatives = (Array.isArray(form?.alternativeUrls) ? form.alternativeUrls : [])
    .map((url) => String(url ?? "").trim())
    .filter(Boolean);
  return [source, ...alternatives].filter(Boolean);
}

export function communityCreatePayload(jobId, form) {
  const alternatives = (Array.isArray(form?.alternativeUrls) ? form.alternativeUrls : [])
    .map((url) => String(url ?? "").trim())
    .filter(Boolean);
  const numericId = /^[1-9]\d*$/.test(String(jobId)) ? Number(jobId) : jobId;
  return {
    jobId: numericId,
    title: String(form?.title ?? "").trim(),
    company: String(form?.company ?? "").trim(),
    location: String(form?.location ?? "").trim(),
    description: String(form?.description ?? "").trim(),
    sourceUrl: String(form?.sourceUrl ?? "").trim(),
    alternativeUrls: alternatives,
    refineDescription: false,
  };
}

export function mapServerFieldErrors(fieldErrors = {}) {
  const next = {};
  Object.entries(fieldErrors).forEach(([key, value]) => {
    const resolveIndex = key.match(/^urls\[(\d+)\]$/);
    if (resolveIndex) {
      const index = Number(resolveIndex[1]);
      next[index === 0 ? "sourceUrl" : `alternativeUrls[${index - 1}]`] = value;
      return;
    }
    next[key] = value;
  });
  return next;
}

export function urlSignature(form) {
  return JSON.stringify([
    String(form?.sourceUrl ?? ""),
    ...(Array.isArray(form?.alternativeUrls) ? form.alternativeUrls : []),
  ]);
}
