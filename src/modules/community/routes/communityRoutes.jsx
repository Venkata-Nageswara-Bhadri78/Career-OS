import { useEffect } from "react";
import { Outlet, Route } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import CommunityAccountGate from "../components/main-components/CommunityAccountGate";
import CommunityAccountProvider from "../components/main-components/CommunityAccountProvider";
import CommunityRoomBoundary from "../components/main-components/CommunityRoomBoundary";
import { COMMUNITY_ACCOUNT_STATES } from "../config/communityConstants";
import { useCommunityAccount } from "../hooks/useCommunityAccount";
import { useCommunityMemberships } from "../hooks/useCommunityMemberships";
import CommunityHomePage from "../pages/CommunityHomePage";
import CommunityRoomPage from "../pages/CommunityRoomPage";
import CommunityStartPage from "../pages/CommunityStartPage";

function CommunityMembershipRefresh() {
  const { state } = useCommunityAccount();
  const { refresh } = useCommunityMemberships();

  useEffect(() => {
    if (state !== COMMUNITY_ACCOUNT_STATES.ACCOUNT_ACTIVE) return undefined;
    const frame = window.requestAnimationFrame(() => {
      void refresh();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [refresh, state]);

  return null;
}

function CommunityShell() {
  return (
    <CommunityAccountProvider>
      <CommunityMembershipRefresh />
      <CommunityAccountGate>
        <Outlet />
      </CommunityAccountGate>
    </CommunityAccountProvider>
  );
}

export function CommunityRouteTree() {
  return (
    <Route element={<CommunityShell />}>
      <Route path={APP_PATHS.COMMUNITY} element={<CommunityHomePage />} />
      <Route path={`${APP_PATHS.COMMUNITY}/start/:jobId`} element={<CommunityStartPage />} />
      <Route
        path={`${APP_PATHS.COMMUNITY}/:communityId`}
        element={
          <CommunityRoomBoundary>
            <CommunityRoomPage />
          </CommunityRoomBoundary>
        }
      />
    </Route>
  );
}
