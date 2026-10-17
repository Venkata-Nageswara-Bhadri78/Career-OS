import { AUTH_MESSAGES, CLIENT_COPY } from "../../../common/api/apiError";

export const COMMUNITY_ERROR_KINDS = Object.freeze({
  UNAUTHENTICATED: "UNAUTHENTICATED",
  EXTENSION_TOKEN: "EXTENSION_TOKEN",
  USERNAME_REQUIRED: "USERNAME_REQUIRED",
  ACCOUNT_REQUIRED: "ACCOUNT_REQUIRED",
  TERMS_CHANGED: "TERMS_CHANGED",
  MEMBERSHIP_REQUIRED: "MEMBERSHIP_REQUIRED",
  COMMUNITY_UNAVAILABLE: "COMMUNITY_UNAVAILABLE",
  JOB_NOT_FOUND: "JOB_NOT_FOUND",
  INVALID_CURSOR: "INVALID_CURSOR",
  INVALID_INPUT: "INVALID_INPUT",
  MATCH_UNCERTAIN: "MATCH_UNCERTAIN",
  ALIAS_CONFLICT: "ALIAS_CONFLICT",
  CONFLICT_GENERIC: "CONFLICT_GENERIC",
  UNKNOWN: "UNKNOWN",
});

const SENTENCES = Object.freeze({
  EXTENSION_TOKEN: "This client is not authorized to access this resource.",
  USERNAME_REQUIRED: AUTH_MESSAGES.COMPLETE_USERNAME,
  ACCOUNT_REQUIRED: "A community account is required. Accept the current terms to create one.",
  TERMS_CHANGED: "The community terms have changed. Accept the current version to continue.",
  MEMBERSHIP_REQUIRED: "Join this community to continue.",
  COMMUNITY_UNAVAILABLE: "This community is not available.",
  JOB_NOT_FOUND_PREFIX: "Job not found with id:",
  INVALID_CURSOR: "Message history cursor is invalid.",
  MATCH_UNCERTAIN:
    "This URL is not specific enough to identify one job posting. Open the posting page and use that URL, including any job id.",
  ALIAS_CONFLICT: "These URLs belong to different communities. Remove the URL that does not match this posting.",
  CONFLICT_GENERIC: "The request conflicts with existing data. Please retry.",
});

const FIELD_BOUNDARY = /,\s*(?=[A-Za-z][\w]*(?:\[\d+\])?\s*:)/;
const FIELD_PART = /^([A-Za-z][\w]*(?:\[\d+\])?)\s*:\s*([\s\S]+)$/;

const NO_ACCOUNT_RETRY = new Set([
  COMMUNITY_ERROR_KINDS.EXTENSION_TOKEN,
  COMMUNITY_ERROR_KINDS.UNAUTHENTICATED,
  COMMUNITY_ERROR_KINDS.USERNAME_REQUIRED,
]);

function sameText(message, expected) {
  if (message === expected) return true;
  return message.toLowerCase() === expected.toLowerCase();
}

function hasPrefix(message, prefix) {
  if (message.startsWith(prefix)) return true;
  return message.toLowerCase().startsWith(prefix.toLowerCase());
}

export function parseCommunityFieldErrors(message) {
  if (!message || typeof message !== "string") return {};
  const fieldErrors = {};
  message.split(FIELD_BOUNDARY).forEach((part) => {
    const match = part.trim().match(FIELD_PART);
    if (!match) return;
    fieldErrors[match[1]] = match[2].trim();
  });
  return fieldErrors;
}

function kindFor(status, message) {
  if (status === 401) return COMMUNITY_ERROR_KINDS.UNAUTHENTICATED;
  if (status === 403) {
    if (sameText(message, SENTENCES.EXTENSION_TOKEN)) return COMMUNITY_ERROR_KINDS.EXTENSION_TOKEN;
    if (sameText(message, SENTENCES.USERNAME_REQUIRED)) return COMMUNITY_ERROR_KINDS.USERNAME_REQUIRED;
    if (sameText(message, SENTENCES.ACCOUNT_REQUIRED)) return COMMUNITY_ERROR_KINDS.ACCOUNT_REQUIRED;
    if (sameText(message, SENTENCES.TERMS_CHANGED)) return COMMUNITY_ERROR_KINDS.TERMS_CHANGED;
    if (sameText(message, SENTENCES.MEMBERSHIP_REQUIRED)) return COMMUNITY_ERROR_KINDS.MEMBERSHIP_REQUIRED;
    return COMMUNITY_ERROR_KINDS.UNKNOWN;
  }
  if (status === 404) {
    if (sameText(message, SENTENCES.COMMUNITY_UNAVAILABLE)) return COMMUNITY_ERROR_KINDS.COMMUNITY_UNAVAILABLE;
    if (hasPrefix(message, SENTENCES.JOB_NOT_FOUND_PREFIX)) return COMMUNITY_ERROR_KINDS.JOB_NOT_FOUND;
    return COMMUNITY_ERROR_KINDS.UNKNOWN;
  }
  if (status === 400) {
    if (sameText(message, SENTENCES.INVALID_CURSOR)) return COMMUNITY_ERROR_KINDS.INVALID_CURSOR;
    return COMMUNITY_ERROR_KINDS.INVALID_INPUT;
  }
  if (status === 409) {
    if (sameText(message, SENTENCES.MATCH_UNCERTAIN)) return COMMUNITY_ERROR_KINDS.MATCH_UNCERTAIN;
    if (sameText(message, SENTENCES.ALIAS_CONFLICT)) return COMMUNITY_ERROR_KINDS.ALIAS_CONFLICT;
    if (sameText(message, SENTENCES.CONFLICT_GENERIC)) return COMMUNITY_ERROR_KINDS.CONFLICT_GENERIC;
    return COMMUNITY_ERROR_KINDS.UNKNOWN;
  }
  return COMMUNITY_ERROR_KINDS.UNKNOWN;
}

export class CommunityError extends Error {
  constructor({ message, status, kind, fieldErrors, data = null }) {
    super(message || CLIENT_COPY.generic);
    this.name = "CommunityError";
    this.status = status ?? 0;
    this.kind = kind;
    this.fieldErrors = fieldErrors ?? {};
    this.data = data;
  }
}

export function classifyCommunityError(error) {
  if (error instanceof CommunityError) return error;
  const status = Number.isFinite(error?.status) ? error.status : 0;
  const message = typeof error?.message === "string" ? error.message.trim() : "";
  return new CommunityError({
    message: message || CLIENT_COPY.generic,
    status,
    kind: kindFor(status, message),
    fieldErrors: parseCommunityFieldErrors(message),
    data: error?.data ?? null,
  });
}

export function communityErrorText(error) {
  if (!error) return "";
  if (error.kind === COMMUNITY_ERROR_KINDS.EXTENSION_TOKEN) {
    return "Use the Career-OS web session. An extension token cannot open Jobs Community.";
  }
  if (typeof error.message === "string" && error.message.trim()) return error.message.trim();
  return CLIENT_COPY.generic;
}

export function canRetryCommunityAccount(error) {
  if (!error?.kind) return false;
  return !NO_ACCOUNT_RETRY.has(error.kind);
}
