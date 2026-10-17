import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listMyCommunities } from "../../api/communityApi";
import { disconnectCommunitySocket } from "../../api/communitySocket";
import { CommunityMembershipsContext } from "../../hooks/communityMembershipsContext";
import { classifyCommunityError, communityErrorText } from "../../utils/communityErrors";

function dedupeCommunities(list) {
  const seen = new Set();
  const next = [];
  (Array.isArray(list) ? list : []).forEach((item) => {
    if (item?.id == null) return;
    const key = String(item.id);
    if (seen.has(key)) return;
    seen.add(key);
    next.push(item);
  });
  return next;
}

export default function CommunityMembershipsProvider({ children }) {
  const [communities, setCommunities] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const generation = useRef(0);
  const activated = useRef(false);

  const refresh = useCallback(async () => {
    const requestId = ++generation.current;
    setStatus("loading");
    setError("");
    try {
      const result = await listMyCommunities();
      if (requestId !== generation.current) return;
      setCommunities(dedupeCommunities(result?.communities));
      setStatus("ready");
    } catch (err) {
      const classified = classifyCommunityError(err);
      if (classified.status === 499 || requestId !== generation.current) return;
      setStatus("error");
      setError(communityErrorText(classified));
    }
  }, []);

  const activate = useCallback(() => {
    if (activated.current) return;
    activated.current = true;
    return refresh();
  }, [refresh]);

  const dropCommunity = useCallback((communityId) => {
    generation.current += 1;
    setCommunities((current) => current.filter((item) => String(item.id) !== String(communityId)));
    setStatus("ready");
    setError("");
  }, []);

  useEffect(() => {
    return () => {
      disconnectCommunitySocket();
    };
  }, []);

  const noteSummary = useCallback((summary) => {
    if (summary?.id == null) return;
    setCommunities((current) => {
      if (current.some((item) => String(item.id) === String(summary.id))) return current;
      return dedupeCommunities([summary, ...current]);
    });
  }, []);

  const value = useMemo(
    () => ({
      communities,
      status,
      error,
      refresh,
      activate,
      dropCommunity,
      noteSummary,
    }),
    [communities, status, error, refresh, activate, dropCommunity, noteSummary]
  );

  return <CommunityMembershipsContext.Provider value={value}>{children}</CommunityMembershipsContext.Provider>;
}
