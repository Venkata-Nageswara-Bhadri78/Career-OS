import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import { getCommunity, getMyMembership, joinCommunity, leaveCommunity, listCommunityMembers } from "../api/communityApi";
import { teardownCommunityRoom } from "../api/communitySocket";
import { beginAutoJoin, clearAutoJoin, noteAutoJoin } from "./communityJoinGate";
import { useCommunityAccount } from "./useCommunityAccount";
import { useCommunityMemberships } from "./useCommunityMemberships";
import { COMMUNITY_ERROR_KINDS, classifyCommunityError, communityErrorText } from "../utils/communityErrors";

const JOIN_ENTRIES = new Set(["JOINED", "REJOINED", "ALREADY_MEMBER"]);
const LEAVE_OUTCOMES = new Set(["LEFT", "ALREADY_LEFT", "NOT_A_MEMBER"]);

function isAbort(error) {
  return error?.status === 499;
}

export function useCommunityRoom(communityId) {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh: refreshAccount } = useCommunityAccount();
  const memberships = useCommunityMemberships();
  const [phase, setPhase] = useState("checking");
  const [preview, setPreview] = useState(null);
  const [header, setHeader] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberCount, setMemberCount] = useState(null);
  const [creator, setCreator] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [roomKey, setRoomKey] = useState(communityId);
  const locationStateRef = useRef(location.state);
  const joiningRef = useRef(false);
  const leavingRef = useRef(false);
  const askedList = useRef(null);

  if (roomKey !== communityId) {
    setRoomKey(communityId);
    setPhase("checking");
    setPreview(null);
    setHeader(null);
    setMembers([]);
    setMemberCount(null);
    setCreator(false);
    setMembersOpen(false);
    setDetailsOpen(false);
    setLeaveOpen(false);
    setError("");
    setMembersError("");
  }

  useEffect(() => {
    locationStateRef.current = location.state;
  }, [location.state]);

  const settleProtectedError = async (errorValue, { quiet = false } = {}) => {
    const classified = classifyCommunityError(errorValue);
    if (isAbort(classified)) return "abort";
    if (classified.kind === COMMUNITY_ERROR_KINDS.MEMBERSHIP_REQUIRED) {
      setHeader(null);
      setMembers([]);
      setPhase("join");
      setError("");
      return "join";
    }
    if (classified.kind === COMMUNITY_ERROR_KINDS.COMMUNITY_UNAVAILABLE) {
      setHeader(null);
      setMembers([]);
      setPhase("unavailable");
      setError(communityErrorText(classified));
      return "unavailable";
    }
    if (
      classified.kind === COMMUNITY_ERROR_KINDS.ACCOUNT_REQUIRED ||
      classified.kind === COMMUNITY_ERROR_KINDS.TERMS_CHANGED
    ) {
      await refreshAccount();
      return "terms";
    }
    if (!quiet) setError(communityErrorText(classified));
    return "error";
  };

  const loadProtected = async (signal) => {
    const [nextHeader, nextMembers, mine] = await Promise.all([
      getCommunity(communityId, { signal }),
      listCommunityMembers(communityId, { signal }),
      getMyMembership(communityId, { signal }).catch((err) => {
        if (isAbort(err)) throw err;
        return null;
      }),
    ]);
    if (signal?.aborted) return;
    setHeader(nextHeader);
    setMembers(Array.isArray(nextMembers?.members) ? nextMembers.members : []);
    setMemberCount(nextHeader?.activeMemberCount ?? nextMembers?.activeMemberCount ?? null);
    setCreator(mine?.creator === true);
    setError("");
    setPhase("room");
    memberships.noteSummary(nextHeader);
    if (askedList.current !== String(communityId)) {
      askedList.current = String(communityId);
      const listed = memberships.communities.some((item) => String(item.id) === String(communityId));
      if (!listed) memberships.refresh();
    }
  };

  useEffect(() => {
    const state = locationStateRef.current;
    const shouldJoin = noteAutoJoin(communityId, state);
    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      try {
        if (shouldJoin) {
          setPreview(state?.summary ?? null);
          setPhase("joining");
          navigate(APP_PATHS.communityRoom(communityId), {
            replace: true,
            state: { summary: state?.summary ?? null },
          });
          const result = await beginAutoJoin(communityId);
          if (cancelled) return;
          clearAutoJoin(communityId);
          if (!JOIN_ENTRIES.has(result?.outcome)) {
            setPhase("join");
            setError("This community could not be joined.");
            return;
          }
          await loadProtected(controller.signal);
          memberships.refresh();
          return;
        }

        if (state?.intent === "open") {
          setPreview(state.summary ?? null);
          setPhase("loading");
          await loadProtected(controller.signal);
          return;
        }

        setPhase("checking");
        const status = await getMyMembership(communityId, { signal: controller.signal });
        if (cancelled) return;
        if (status?.membership === "MEMBER") {
          setPhase("loading");
          await loadProtected(controller.signal);
          return;
        }
        setPreview(null);
        setPhase("join");
      } catch (err) {
        if (cancelled || isAbort(err)) return;
        const outcome = await settleProtectedError(err);
        if (cancelled) return;
        if (shouldJoin) clearAutoJoin(communityId);
        if (outcome === "error") setPhase(shouldJoin ? "join" : "error");
      }
    };

    const frame = window.requestAnimationFrame(() => {
      void run();
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      controller.abort();
    };
    // Entry is keyed by the room id. Location intent is read once per entry so
    // replacing the history state cannot submit join again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, attempt]);

  useEffect(() => {
    if (!membersOpen || phase !== "room") return undefined;
    const controller = new AbortController();
    let ignore = false;
    listCommunityMembers(communityId, { signal: controller.signal })
      .then((result) => {
        if (ignore) return;
        setMembers(Array.isArray(result?.members) ? result.members : []);
        if (result?.activeMemberCount != null) setMemberCount(result.activeMemberCount);
        setMembersError("");
      })
      .catch((err) => {
        if (ignore || isAbort(err)) return;
        void settleProtectedError(err, { quiet: true }).then((outcome) => {
          if (outcome === "error") setMembersError(communityErrorText(classifyCommunityError(err)));
        });
      })
      .finally(() => {
        if (!ignore) setMembersLoading(false);
      });
    return () => {
      ignore = true;
      controller.abort();
    };
    // Refetch only when the panel opens. Closing it does not poll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membersOpen, communityId, phase]);

  const join = async () => {
    if (joiningRef.current) return;
    joiningRef.current = true;
    setPhase("joining");
    setError("");
    try {
      const result = await joinCommunity(communityId);
      if (!JOIN_ENTRIES.has(result?.outcome)) {
        setPhase("join");
        setError("This community could not be joined.");
        return;
      }
      setPhase("loading");
      await loadProtected();
      memberships.refresh();
    } catch (err) {
      if (isAbort(err)) return;
      const outcome = await settleProtectedError(err);
      if (outcome === "error") setPhase("join");
    } finally {
      joiningRef.current = false;
    }
  };

  const confirmLeave = async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    setError("");
    try {
      const result = await leaveCommunity(communityId);
      if (!LEAVE_OUTCOMES.has(result?.outcome)) {
        setError("This community could not be left.");
        return;
      }
      teardownCommunityRoom(communityId);
      memberships.dropCommunity(communityId);
      setLeaveOpen(false);
      navigate(APP_PATHS.COMMUNITY, {
        replace: true,
        state: { communityLeft: result?.message || "You left the community. It remains open." },
      });
      memberships.refresh();
    } catch (err) {
      if (!isAbort(err)) setError(communityErrorText(classifyCommunityError(err)));
    } finally {
      leavingRef.current = false;
      setLeaving(false);
    }
  };

  const openMembers = () => {
    setDetailsOpen(false);
    setMembersError("");
    setMembersLoading(true);
    setMembersOpen(true);
  };

  const openDetails = () => {
    setMembersOpen(false);
    setDetailsOpen(true);
  };

  return {
    phase,
    preview,
    header,
    members,
    memberCount,
    creator,
    membersOpen,
    detailsOpen,
    membersLoading,
    membersError,
    leaveOpen,
    leaving,
    error,
    openMembers,
    closeMembers: () => setMembersOpen(false),
    openDetails,
    closeDetails: () => setDetailsOpen(false),
    requestLeave: () => setLeaveOpen(true),
    cancelLeave: () => {
      if (!leaving) setLeaveOpen(false);
    },
    confirmLeave,
    join,
    retry: () => setAttempt((current) => current + 1),
    handleProtectedFailure: settleProtectedError,
  };
}
