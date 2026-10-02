import { Route } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import ChatAssistantPage from "../pages/ChatAssistantPage";
import CustomPromptsPage from "../pages/CustomPromptsPage";

export { default as ChatHistoryShellBinder } from "../components/main-components/ChatHistoryShellBinder";

export function ChatAssistantRouteTree() {
  return [
    <Route key="job-chat" path="/jobs/:jobId/interact" element={<ChatAssistantPage />} />,
    <Route key="custom-prompts" path={APP_PATHS.CUSTOM_PROMPTS} element={<CustomPromptsPage />} />,
  ];
}
