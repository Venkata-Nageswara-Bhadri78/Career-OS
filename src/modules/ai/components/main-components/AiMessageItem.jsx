import AiMarkdownRenderer from "./AiMarkdownRenderer";

export default function AiMessageItem({ message, isLatestStreaming = false }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end my-4">
        <div className="max-w-[85%] sm:max-w-2xl bg-field text-ink rounded-3xl px-5 py-3.5 text-[15px] leading-relaxed">
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-6">
      <AiMarkdownRenderer content={message.content} isStreaming={isLatestStreaming} mode={message.mode} />
      {message.stopped && !isLatestStreaming ? (
        <p className="mt-2 text-[11px] text-muted">Generation stopped.</p>
      ) : null}
    </div>
  );
}
