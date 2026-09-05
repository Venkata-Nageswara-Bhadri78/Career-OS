import { Route } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import AiChatPage from "../pages/AiChatPage";

export function AiRouteTree() {
  return <Route path={APP_PATHS.AI} element={<AiChatPage />} />;
}

export default AiRouteTree;
