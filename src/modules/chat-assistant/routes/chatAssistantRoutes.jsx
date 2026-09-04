import { Route } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import ChatAssistantPage from "../pages/ChatAssistantPage";

export { default as ChatHistoryShellBinder } from "../components/main-components/ChatHistoryShellBinder";

export function ChatAssistantRouteTree() {
  return (
    <>
      <Route path="/jobs/:jobId/interact" element={<ChatAssistantPage />} />
      <Route path={APP_PATHS.AI} element={<ChatAssistantPage />} />
    </>
  );
}
