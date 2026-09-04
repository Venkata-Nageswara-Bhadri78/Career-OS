import { useParams } from "react-router-dom";
import ChatInterface from "../components/main-components/ChatInterface";
import "../styles/chatAssistant.css";

function parseJobId(value) {
  const jobId = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(jobId) && jobId > 0 ? jobId : null;
}

export default function ChatAssistantPage() {
  const { jobId } = useParams();
  const selectedJobId = parseJobId(jobId);

  return (
    <div className="chat-assistant-service h-full min-h-0 w-full flex flex-col bg-bg font-sans text-ink overflow-hidden">
      <ChatInterface key={selectedJobId || "new"} jobId={selectedJobId} />
    </div>
  );
}
