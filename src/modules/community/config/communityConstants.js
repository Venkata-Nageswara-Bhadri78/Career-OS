import { API_PREFIX } from "../../../common/api/apiConfig";

export const COMMUNITY_ROOT = `${API_PREFIX}/community`;

function communityPath(communityId, suffix = "") {
  return `${COMMUNITY_ROOT}/${encodeURIComponent(String(communityId))}${suffix}`;
}

export const COMMUNITY_ENDPOINTS = Object.freeze({
  ROOT: COMMUNITY_ROOT,
  ACCOUNT: `${COMMUNITY_ROOT}/account`,
  RESOLVE: `${COMMUNITY_ROOT}/resolve`,
  REFINE: `${COMMUNITY_ROOT}/descriptions/refine`,
  MEMBERSHIPS: `${COMMUNITY_ROOT}/memberships`,
  prefill: (jobId) => `${COMMUNITY_ROOT}/jobs/${encodeURIComponent(String(jobId))}/prefill`,
  community: (communityId) => communityPath(communityId),
  members: (communityId) => communityPath(communityId, "/members"),
  membership: (communityId) => communityPath(communityId, "/membership"),
  join: (communityId) => communityPath(communityId, "/join"),
  leave: (communityId) => communityPath(communityId, "/leave"),
  messages: (communityId) => communityPath(communityId, "/messages"),
});

export const COMMUNITY_LIMITS = Object.freeze({
  PAGE_SIZE: 30,
  PAGE_SIZE_MAX: 50,
  MESSAGE_MAX_CODE_POINTS: 4000,
  ALIAS_HINT: 8,
  RESOLVE_URL_MAX: 20,
  TITLE_MAX: 255,
  COMPANY_MAX: 255,
  LOCATION_MAX: 255,
  DESCRIPTION_MAX: 50000,
  URL_MAX: 2000,
  TERMS_VERSION_MAX: 64,
});

export const COMMUNITY_HEARTBEAT_MS = 10000;

export const COMMUNITY_SEND_TIMEOUT_MS = 10000;

/** Task 5 owns the socket. The docs require backoff with a cap and do not give millisecond values. */
export const COMMUNITY_RECONNECT = Object.freeze({
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
  MULTIPLIER: 2,
});

export const COMMUNITY_WS_PATH = "/ws/community";

export const COMMUNITY_SOCKET_DEST = Object.freeze({
  USER_ERRORS: "/user/queue/errors",
  USER_MEMBERSHIP: "/user/queue/membership",
  USER_PRESENCE: "/user/queue/presence",
  send: (communityId) => `/app/communities/${communityId}/messages`,
  messages: (communityId) => `/topic/communities/${communityId}/messages`,
  presence: (communityId) => `/topic/communities/${communityId}/presence`,
});

export const COMMUNITY_SOCKET_CODES = Object.freeze({
  MEMBERSHIP_REQUIRED: "MEMBERSHIP_REQUIRED",
  ACCOUNT_REQUIRED: "ACCOUNT_REQUIRED",
  TERMS_REQUIRED: "TERMS_REQUIRED",
  COMMUNITY_UNAVAILABLE: "COMMUNITY_UNAVAILABLE",
  INVALID_MESSAGE: "INVALID_MESSAGE",
  DESTINATION_NOT_ALLOWED: "DESTINATION_NOT_ALLOWED",
  SEND_FAILED: "SEND_FAILED",
});

export const COMMUNITY_SOCKET_STATES = Object.freeze({
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
  FAILED: "failed",
  UNAUTHORIZED: "unauthorized",
});

export const COMMUNITY_ACCOUNT_STATES = Object.freeze({
  TERMS_ACCEPTANCE_REQUIRED: "TERMS_ACCEPTANCE_REQUIRED",
  TERMS_REACCEPTANCE_REQUIRED: "TERMS_REACCEPTANCE_REQUIRED",
  ACCOUNT_ACTIVE: "ACCOUNT_ACTIVE",
});

export const COMMUNITY_MATCH = Object.freeze({
  NO_COMMUNITY: "NO_COMMUNITY",
  EXISTING_COMMUNITY: "EXISTING_COMMUNITY",
  MATCH_UNCERTAIN: "MATCH_UNCERTAIN",
  ALIAS_CONFLICT: "ALIAS_CONFLICT",
  CREATED: "CREATED",
});

export const COMMUNITY_MEMBERSHIP = Object.freeze({
  MEMBER: "MEMBER",
  NOT_A_MEMBER: "NOT_A_MEMBER",
});

export const COMMUNITY_CREATE_FIELDS = Object.freeze([
  "jobId",
  "title",
  "company",
  "location",
  "description",
  "sourceUrl",
  "alternativeUrls",
  "refineDescription",
]);

const TERMS_VERSION_1 = Object.freeze({
  title: "Jobs Community terms",
  paragraphs: Object.freeze([
    "Jobs Community is a shared chat for one job posting. People who join that community can read the messages there and post their own.",
    "Do not post private information. That includes salary, a resume, an email address, a phone number, and other personal details.",
    "Leaving removes only you. The community, its messages, and the other members stay. You can join the same room again later.",
    "Opening this page is not acceptance. Use the button below only if you agree to these terms.",
  ]),
});

/** Frontend-owned copy, keyed by the exact currentTermsVersion string. "1" and "v1" are different. */
export const TERMS_COPY = Object.freeze({
  "1": TERMS_VERSION_1,
});

export function termsCopyFor(version) {
  if (typeof version !== "string") return null;
  if (!Object.prototype.hasOwnProperty.call(TERMS_COPY, version)) return null;
  return TERMS_COPY[version];
}
