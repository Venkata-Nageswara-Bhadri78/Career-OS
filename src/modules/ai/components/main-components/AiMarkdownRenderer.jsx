import { AI_MODES } from "../../config/aiConfig";
import { isEmailOrOutreachBlock } from "../../utils/formatters";
import AiInlineText from "../sub-components/AiInlineText";
import AiTableBlock from "../sub-components/AiTableBlock";
import AiCodeBlock from "./AiCodeBlock";
import AiEmailBlock from "./AiEmailBlock";

export default function AiMarkdownRenderer({ content = "", isStreaming = false, mode = null }) {
  if (!content) {
    return isStreaming ? <span className="inline-block h-3 w-1.5 bg-ink animate-pulse ml-0.5" /> : null;
  }

  const treatAsEmail = !isStreaming && isEmailOrOutreachBlock(content);

  if (treatAsEmail) {
    const isCoverLetter = content.toLowerCase().includes("cover letter") || mode === AI_MODES.COVER_LETTER;
    return <AiEmailBlock content={content} title={isCoverLetter ? "Cover letter" : "Cold outreach email"} />;
  }

  const segments = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) segments.push({ type: "markdown", content: textBefore });
    segments.push({
      type: "code",
      language: match[1] || "text",
      content: match[2].replace(/\n$/, ""),
    });
    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    const openCodeMatch = remainingText.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*)$/);
    if (openCodeMatch && isStreaming) {
      const textBefore = remainingText.substring(0, openCodeMatch.index);
      if (textBefore) segments.push({ type: "markdown", content: textBefore });
      segments.push({
        type: "code",
        language: openCodeMatch[1] || "text",
        content: openCodeMatch[2],
      });
    } else {
      segments.push({ type: "markdown", content: remainingText });
    }
  }

  let elementKey = 0;

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-ink break-words font-normal">
      {segments.map((segment) => {
        if (segment.type === "code") {
          return <AiCodeBlock key={`code-${elementKey++}`} code={segment.content} language={segment.language} />;
        }

        const lines = segment.content.split("\n");
        const renderedElements = [];
        let inTable = false;
        let tableLines = [];

        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          const trimmed = line.trim();

          if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            inTable = true;
            tableLines.push(trimmed);
            continue;
          }
          if (inTable) {
            renderedElements.push(<AiTableBlock key={`table-${elementKey++}`} lines={tableLines} />);
            inTable = false;
            tableLines = [];
          }

          if (!trimmed) {
            renderedElements.push(<div key={`sp-${elementKey++}`} className="h-2" />);
            continue;
          }

          if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
            renderedElements.push(<hr key={`hr-${elementKey++}`} className="my-6 border-t border-line" />);
            continue;
          }

          if (trimmed.startsWith("#### ")) {
            renderedElements.push(
              <h5 key={`h5-${elementKey++}`} className="text-sm font-bold text-ink mt-3 mb-1">
                <AiInlineText text={trimmed.replace(/^####\s+/, "")} />
              </h5>
            );
          } else if (trimmed.startsWith("### ")) {
            renderedElements.push(
              <h4 key={`h4-${elementKey++}`} className="text-base font-bold text-ink mt-4 mb-1.5">
                <AiInlineText text={trimmed.replace(/^###\s+/, "")} />
              </h4>
            );
          } else if (trimmed.startsWith("## ")) {
            renderedElements.push(
              <h3 key={`h3-${elementKey++}`} className="text-lg font-bold text-ink mt-5 mb-2">
                <AiInlineText text={trimmed.replace(/^##\s+/, "")} />
              </h3>
            );
          } else if (trimmed.startsWith("# ")) {
            renderedElements.push(
              <h2 key={`h2-${elementKey++}`} className="text-xl font-bold text-ink mt-6 mb-2">
                <AiInlineText text={trimmed.replace(/^#\s+/, "")} />
              </h2>
            );
          } else if (trimmed.startsWith("> ")) {
            renderedElements.push(
              <blockquote key={`bq-${elementKey++}`} className="pl-3 py-1.5 my-2 border-l-2 border-line text-ink/80 italic bg-field/60 rounded-r-md text-[14px]">
                <AiInlineText text={trimmed.replace(/^>\s*/, "")} />
              </blockquote>
            );
          } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
            renderedElements.push(
              <div key={`li-${elementKey++}`} className="flex items-start gap-2.5 pl-1 my-1">
                <span className="text-muted leading-relaxed shrink-0">•</span>
                <span className="flex-1">
                  <AiInlineText text={trimmed.replace(/^[-*•]\s+/, "")} />
                </span>
              </div>
            );
          } else if (/^\d+\.\s+/.test(trimmed)) {
            const numbered = trimmed.match(/^(\d+)\.\s+(.*)$/);
            renderedElements.push(
              <div key={`ol-${elementKey++}`} className="flex items-start gap-2 pl-1 my-1">
                <span className="font-semibold text-ink/80 shrink-0">{numbered[1]}.</span>
                <span className="flex-1">
                  <AiInlineText text={numbered[2]} />
                </span>
              </div>
            );
          } else {
            renderedElements.push(
              <p key={`p-${elementKey++}`} className="leading-relaxed">
                <AiInlineText text={trimmed} />
              </p>
            );
          }
        }

        if (inTable && tableLines.length > 0) {
          renderedElements.push(<AiTableBlock key={`table-${elementKey++}`} lines={tableLines} />);
        }

        return <div key={`seg-${elementKey++}`}>{renderedElements}</div>;
      })}
      {isStreaming ? <span className="inline-block h-4 w-1.5 bg-ink animate-pulse ml-0.5 align-middle" /> : null}
    </div>
  );
}
