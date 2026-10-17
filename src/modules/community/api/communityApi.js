import { request } from "../../../common/api/httpClient";
import { COMMUNITY_CREATE_FIELDS, COMMUNITY_ENDPOINTS } from "../config/communityConstants";
import {
  mapCommunitySummary,
  mapConsent,
  mapCreateResult,
  mapHistoryPage,
  mapJoinResult,
  mapLeaveResult,
  mapMembersResult,
  mapMembershipList,
  mapMembershipResult,
  mapCommunityPrefill,
  mapRefineResult,
  mapResolveResult,
} from "../mappers/communityMappers";
import { CommunityError, classifyCommunityError } from "../utils/communityErrors";

export { getAuthorizationHeader } from "../../../common/api/sessionBridge";

function unwrapEnvelope(body) {
  if (body && typeof body === "object" && body.success === false) {
    const message = typeof body.message === "string" ? body.message.trim() : "";
    // request() returns the body only, so an OK failure envelope has no status code to read.
    throw classifyCommunityError({ message, status: 200, data: body });
  }
  const data =
    body && typeof body === "object" && Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body;
  const message = body && typeof body === "object" && typeof body.message === "string" ? body.message : "";
  return { data, message };
}

function dataFromEnvelope(body) {
  return unwrapEnvelope(body).data;
}

async function communityRequest(options) {
  try {
    const body = await request(options);
    return dataFromEnvelope(body);
  } catch (error) {
    if (error instanceof CommunityError) throw error;
    throw classifyCommunityError(error);
  }
}

function documentedCreateBody(input) {
  const source = input && typeof input === "object" ? input : {};
  const body = {};
  COMMUNITY_CREATE_FIELDS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      body[key] = source[key];
    }
  });
  return body;
}

export function getCommunityAccount({ signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.ACCOUNT,
    method: "GET",
    signal,
  }).then(mapConsent);
}

export function acceptCommunityTerms({ termsVersion, signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.ACCOUNT,
    method: "POST",
    body: { accepted: true, termsVersion },
    signal,
  }).then(mapConsent);
}

export function getJobCommunityPrefill(jobId, { signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.prefill(jobId),
    method: "GET",
    signal,
  }).then(mapCommunityPrefill);
}

export function resolveCommunityUrls({ urls } = {}, { signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.RESOLVE,
    method: "POST",
    body: { urls },
    signal,
  }).then(mapResolveResult);
}

export async function refineCommunityDescription({ description } = {}, { signal } = {}) {
  try {
    const body = await request({
      endpoint: COMMUNITY_ENDPOINTS.REFINE,
      method: "POST",
      body: { description },
      signal,
    });
    const envelope = unwrapEnvelope(body);
    return mapRefineResult(envelope.data, envelope.message);
  } catch (error) {
    if (error instanceof CommunityError) throw error;
    throw classifyCommunityError(error);
  }
}

export function createCommunity(body, { signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.ROOT,
    method: "POST",
    body: documentedCreateBody(body),
    signal,
  }).then(mapCreateResult);
}

export function listMyCommunities({ signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.MEMBERSHIPS,
    method: "GET",
    signal,
  }).then(mapMembershipList);
}

export function getCommunity(communityId, { signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.community(communityId),
    method: "GET",
    signal,
  }).then(mapCommunitySummary);
}

export function listCommunityMembers(communityId, { signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.members(communityId),
    method: "GET",
    signal,
  }).then(mapMembersResult);
}

export function getMyMembership(communityId, { signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.membership(communityId),
    method: "GET",
    signal,
  }).then(mapMembershipResult);
}

export function joinCommunity(communityId, { signal } = {}) {
  // The shared client always sends JSON. An empty object keeps every field off the wire.
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.join(communityId),
    method: "POST",
    body: {},
    signal,
  }).then(mapJoinResult);
}

export function leaveCommunity(communityId, { signal } = {}) {
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.leave(communityId),
    method: "POST",
    body: {},
    signal,
  }).then(mapLeaveResult);
}

export function getCommunityMessages(communityId, { cursor, limit, signal } = {}) {
  const query = {};
  if (typeof cursor === "string" && cursor.length > 0) query.cursor = cursor;
  if (limit != null && limit !== "") query.limit = limit;
  return communityRequest({
    endpoint: COMMUNITY_ENDPOINTS.messages(communityId),
    method: "GET",
    query,
    signal,
  }).then(mapHistoryPage);
}

const communityApi = {
  getCommunityAccount,
  acceptCommunityTerms,
  getJobCommunityPrefill,
  resolveCommunityUrls,
  refineCommunityDescription,
  createCommunity,
  listMyCommunities,
  getCommunity,
  listCommunityMembers,
  getMyMembership,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
};

export default communityApi;
