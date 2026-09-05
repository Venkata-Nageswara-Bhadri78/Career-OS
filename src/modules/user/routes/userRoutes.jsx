import { Route } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import UserProfilePage from "../pages/UserProfilePage";

export function UserRouteTree() {
  return <Route path={APP_PATHS.PROFILE} element={<UserProfilePage />} />;
}

export default UserRouteTree;
