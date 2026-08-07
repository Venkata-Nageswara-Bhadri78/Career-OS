import AiMarkdownRenderer from "./AiMarkdownRenderer";

export default function AiMessageItem({ message, isLatestStreaming = false }) {
  const isUser = message.sender === "user" || message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end my-4 animate-in fade-in duration-150">
        <div className="max-w-[85%] sm:max-w-2xl bg-[#f4f4f4] text-zinc-900 rounded-3xl px-5 py-3.5 text-[15px] leading-relaxed select-text font-normal shadow-2xs">
          <div className="whitespace-pre-wrap">{message.content || message.text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flexjustify-start w-full my-6 animate-in fade-in duration-150">
      <div className="w-full text-[15px] leading-relaxed text-zinc-900 select-text font-normal">
        <AiMarkdownRenderer
          content={message.content || message.text}
          isStreaming={isLatestStreaming}
          mode={message.mode}
        />
      </div>
    </div>
  );
}
