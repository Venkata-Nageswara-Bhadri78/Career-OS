import { Route } from "react-router-dom";
import ChatAssistantPage from "../pages/ChatAssistantPage";

export { default as ChatHistoryShellBinder } from "../components/main-components/ChatHistoryShellBinder";

export function ChatAssistantRouteTree() {
  return <Route path="/jobs/:jobId/interact" element={<ChatAssistantPage />} />;
}
