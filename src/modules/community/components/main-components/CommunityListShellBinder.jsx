import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCommunityListSlotSetter } from "../../hooks/communityListContext";
import { useCommunityMemberships } from "../../hooks/useCommunityMemberships";
import { isCommunityAreaPath, readCommunityIdFromPath } from "../../utils/communityDisplay";

export default function CommunityListShellBinder() {
  const setSlot = useCommunityListSlotSetter();
  const location = useLocation();
  const { activate, communities, status, error, refresh } = useCommunityMemberships();
  const currentCommunityId = readCommunityIdFromPath(location.pathname);

  useLayoutEffect(() => {
    if (isCommunityAreaPath(location.pathname)) activate();
  }, [location.pathname, activate]);

  useLayoutEffect(() => {
    setSlot({
      communities,
      status,
      isLoading: status === "loading",
      error: status === "error" ? error : "",
      currentCommunityId,
      refresh,
      retry: refresh,
      activate,
      selectCommunity: () => {},
    });
  }, [
    communities,
    status,
    error,
    refresh,
    activate,
    currentCommunityId,
    setSlot,
  ]);

  return null;
}
