function asText(value) {
  if (value == null) return null;
  return typeof value === "string" ? value : String(value);
}

function asTimestamp(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asCount(value) {
  if (value == null || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function asId(value) {
  return value == null || value === "" ? null : value;
}

export function mapCommunitySummary(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: asId(raw.id),
    communityName: asText(raw.communityName),
    title: asText(raw.title),
    company: asText(raw.company),
    location: asText(raw.location),
    description: asText(raw.description),
    createdAt: asTimestamp(raw.createdAt),
    membership: asText(raw.membership),
    activeMemberCount: asCount(raw.activeMemberCount),
  };
}

export function mapCommunityPerson(raw) {
  const username = asText(raw?.username);
  const fullName = asText(raw?.fullName);
  const named = fullName && fullName.trim() ? fullName.trim() : null;
  const handle = username && username.trim() ? username.trim() : null;
  return {
    userId: asId(raw?.userId),
    username,
    fullName,
    displayName: named || handle,
  };
}

export function mapCommunityMember(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    ...mapCommunityPerson(raw),
    membershipStatus: asText(raw.membershipStatus),
    joinedAt: asTimestamp(raw.joinedAt),
  };
}

export function mapCommunityMessage(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: asId(raw.id),
    communityId: asId(raw.communityId),
    sender: mapCommunityPerson(raw.sender),
    content: asText(raw.content),
    createdAt: asTimestamp(raw.createdAt),
  };
}

export function mapHistoryPage(raw) {
  const messages = Array.isArray(raw?.messages) ? raw.messages.map(mapCommunityMessage).filter(Boolean) : [];
  return {
    communityId: asId(raw?.communityId),
    messages,
    hasMore: raw?.hasMore === true,
    nextCursor: typeof raw?.nextCursor === "string" && raw.nextCursor.length > 0 ? raw.nextCursor : null,
  };
}

export function mapCommunityAccount(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: asId(raw.id),
    acceptedTermsVersion: asText(raw.acceptedTermsVersion),
    termsAcceptedAt: asTimestamp(raw.termsAcceptedAt),
    createdAt: asTimestamp(raw.createdAt),
  };
}

export function mapConsent(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      state: null,
      accountPresent: false,
      termsAcceptanceRequired: false,
      currentTermsVersion: null,
      account: null,
    };
  }
  return {
    state: asText(raw.state),
    accountPresent: raw.accountPresent === true,
    termsAcceptanceRequired: raw.termsAcceptanceRequired === true,
    currentTermsVersion: typeof raw.currentTermsVersion === "string" ? raw.currentTermsVersion : null,
    account: raw.account ? mapCommunityAccount(raw.account) : null,
  };
}

export function mapCommunityPrefill(raw) {
  const match = raw?.match && typeof raw.match === "object" ? raw.match : null;
  return {
    jobId: asId(raw?.jobId),
    title: asText(raw?.title),
    company: asText(raw?.company),
    location: asText(raw?.location),
    description: asText(raw?.description),
    sourceUrl: asText(raw?.sourceUrl),
    match: {
      outcome: asText(match?.outcome),
      message: asText(match?.message),
      community: match?.community ? mapCommunitySummary(match.community) : null,
    },
  };
}

export function mapResolveResult(raw) {
  return {
    outcome: asText(raw?.outcome),
    message: asText(raw?.message),
    community: raw?.community ? mapCommunitySummary(raw.community) : null,
  };
}

export function mapRefineResult(raw, message = "") {
  return {
    description: asText(raw?.description),
    refined: raw?.refined === true,
    message: typeof message === "string" ? message : "",
  };
}

export function mapCreateResult(raw) {
  return {
    outcome: asText(raw?.outcome),
    message: asText(raw?.message),
    descriptionRefined: raw?.descriptionRefined === true,
    community: raw?.community ? mapCommunitySummary(raw.community) : null,
  };
}

export function mapMembershipResult(raw) {
  return {
    outcome: asText(raw?.outcome),
    message: asText(raw?.message),
    communityId: asId(raw?.communityId),
    membership: asText(raw?.membership),
    membershipStatus: asText(raw?.membershipStatus),
    joinedAt: asTimestamp(raw?.joinedAt),
    leftAt: asTimestamp(raw?.leftAt),
    creator: raw?.creator === true,
    activeMemberCount: asCount(raw?.activeMemberCount),
  };
}

export function mapJoinResult(raw) {
  return mapMembershipResult(raw);
}

export function mapLeaveResult(raw) {
  return mapMembershipResult(raw);
}

export function mapMembershipList(raw) {
  const communities = Array.isArray(raw?.communities) ? raw.communities.map(mapCommunitySummary).filter(Boolean) : [];
  return { communities };
}

export function mapMembersResult(raw) {
  const members = Array.isArray(raw?.members) ? raw.members.map(mapCommunityMember).filter(Boolean) : [];
  return {
    communityId: asId(raw?.communityId),
    activeMemberCount: asCount(raw?.activeMemberCount),
    members,
  };
}
