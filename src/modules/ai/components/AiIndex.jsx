import AiChatPage from "../pages/AiChatPage";

export { default as AiChatPage } from "../pages/AiChatPage";
export { AiRouteTree } from "../routes/aiRoutes";

export default function AiIndex() {
  return <AiChatPage />;
}
