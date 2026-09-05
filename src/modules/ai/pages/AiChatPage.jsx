import useAiChat from "../hooks/useAiChat";
import useAiGrounding from "../hooks/useAiGrounding";
import AiWorkspace from "../components/main-components/AiWorkspace";
import "../styles/ai.css";

export default function AiChatPage() {
  const grounding = useAiGrounding();
  const chat = useAiChat(grounding);

  return (
    <div className="ai-service h-full min-h-0 w-full flex flex-col bg-bg font-sans text-ink overflow-hidden">
      <AiWorkspace grounding={grounding} chat={chat} />
    </div>
  );
}
