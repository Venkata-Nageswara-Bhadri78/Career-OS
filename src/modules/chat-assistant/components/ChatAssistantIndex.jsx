import { useParams } from "react-router-dom";
import ChatAssistantPage from "../pages/ChatAssistantPage";

export default function ChatAssistantIndex() {
  const { jobId } = useParams();
  
  // Convert jobId string to number if present
  const parsedJobId = jobId ? parseInt(jobId, 10) : null;

  return <ChatAssistantPage key={parsedJobId || 'new'} initialJobId={parsedJobId} />;
}
