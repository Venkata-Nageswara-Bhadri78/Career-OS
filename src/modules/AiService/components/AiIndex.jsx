import AiChatPage from "../pages/AiChatPage";

export { default as AiChatPage } from "../pages/AiChatPage";
export { default as AiRouter } from "../routes/AiRouter";
export { default as AiNavbar } from "./main-components/AiNavbar";
export { default as AiChatInterface } from "./main-components/AiChatInterface";
export { default as AiJobBanner } from "./main-components/AiJobBanner";
export { default as JobDetailsDrawer } from "../../JobService/components/main-components/JobDetailsDrawer";

export default function AiIndex() {
  return <AiChatPage />;
}
