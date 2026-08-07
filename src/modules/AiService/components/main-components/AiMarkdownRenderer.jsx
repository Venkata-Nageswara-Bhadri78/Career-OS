import React from "react";
import AiCodeBlock from "./AiCodeBlock";
import AiEmailBlock from "./AiEmailBlock";
import { isEmailOrOutreachBlock } from "../../helpers/aiFormatters";

/**
 * Format inline markdown tokens (bold, italics, inline code, links)
 */
function renderInlineText(text) {
  if (!text) return null;

  // Split by inline code, bold, italic
  const parts = [];
  let remaining = text;
  let key = 0;

  // Regex for **bold**, `code`, *italic*
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/;

  while (remaining) {
    const match = remaining.match(tokenRegex);
    if (!match) {
      parts.push(remaining);
      break;
    }

    const index = match.index;
    if (index > 0) {
      parts.push(remaining.substring(0, index));
    }

    const matchedToken = match[0];
    if (matchedToken.startsWith("**") && matchedToken.endsWith("**")) {
      parts.push(
        <strong key={`b-${key++}`} className="font-bold text-zinc-900">
          {matchedToken.slice(2, -2)}
        </strong>
      );
    } else if (matchedToken.startsWith("`") && matchedToken.endsWith("`")) {
      parts.push(
        <code
          key={`c-${key++}`}
          className="px-1.5 py-0.5 rounded-md bg-zinc-200/70 text-zinc-900 font-mono text-[11px] border border-zinc-300/60"
        >
          {matchedToken.slice(1, -1)}
        </code>
      );
    } else if (matchedToken.startsWith("*") && matchedToken.endsWith("*")) {
      parts.push(
        <em key={`i-${key++}`} className="italic text-zinc-800">
          {matchedToken.slice(1, -1)}
        </em>
      );
    }

    remaining = remaining.substring(index + matchedToken.length);
  }

  return parts;
}

/**
 * Helper to parse and render Markdown Tables
 */
function renderTable(tableLines, tableKey) {
  if (!tableLines || tableLines.length < 2) return null;

  const headerCells = tableLines[0]
    .split("|")
    .map((c) => c.trim())
    .filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1);

  // Skip delimiter row (index 1)
  const rows = tableLines.slice(2).map((rowStr) =>
    rowStr
      .split("|")
      .map((c) => c.trim())
      .filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1)
  );

  return (
    <div key={tableKey} className="my-3 overflow-x-auto rounded-xl border border-zinc-200 shadow-2xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-zinc-100/90 border-b border-zinc-200 text-zinc-800 font-bold">
          <tr>
            {headerCells.map((h, i) => (
              <th key={i} className="py-2 px-3">
                {renderInlineText(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {rows.map((r, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-zinc-50/80 transition-colors">
              {r.map((cell, colIdx) => (
                <td key={colIdx} className="py-2 px-3 text-zinc-700">
                  {renderInlineText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AiMarkdownRenderer({ content = "", isStreaming = false, mode = null }) {
  if (!content) {
    return isStreaming ? (
      <span className="inline-block h-3 w-1.5 bg-black animate-pulse ml-0.5" />
    ) : null;
  }

  // Check if this entire block is a specialized Cold Email or Cover Letter
  if (isEmailOrOutreachBlock(content)) {
    const isCoverLetter =
      content.toLowerCase().includes("cover letter") || mode === "COVER_LETTER";
    return (
      <div className="space-y-2">
        <AiEmailBlock
          content={content}
          title={isCoverLetter ? "Tailored Cover Letter" : "Cold Outreach Email"}
        />
        {isStreaming && <span className="inline-block h-3 w-1.5 bg-black animate-pulse ml-0.5" />}
      </div>
    );
  }

  // Split by code blocks first
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
    // Check if partial code block is currently streaming
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
    <div className="space-y-3 text-[15px] leading-relaxed text-zinc-900 wrap-break-words font-normal">
      {segments.map((segment) => {
        if (segment.type === "code") {
          return (
            <AiCodeBlock
              key={`code-${elementKey++}`}
              code={segment.content}
              language={segment.language}
            />
          );
        }

        // Process markdown text lines
        const lines = segment.content.split("\n");
        const renderedElements = [];
        let inTable = false;
        let tableLines = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();

          // Table detection
          if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            inTable = true;
            tableLines.push(trimmed);
            continue;
          } else if (inTable) {
            renderedElements.push(renderTable(tableLines, `table-${elementKey++}`));
            inTable = false;
            tableLines = [];
          }

          if (!trimmed) {
            renderedElements.push(<div key={`sp-${elementKey++}`} className="h-2" />);
            continue;
          }

          // Horizontal rule
          if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
            renderedElements.push(
              <hr key={`hr-${elementKey++}`} className="my-6 border-t border-zinc-200" />
            );
            continue;
          }

          // Headers
          if (trimmed.startsWith("#### ")) {
            renderedElements.push(
              <h5 key={`h5-${elementKey++}`} className="text-sm font-bold text-zinc-900 mt-3 mb-1">
                {renderInlineText(trimmed.replace(/^####\s+/, ""))}
              </h5>
            );
          } else if (trimmed.startsWith("### ")) {
            renderedElements.push(
              <h4 key={`h4-${elementKey++}`} className="text-base font-bold text-zinc-900 mt-4 mb-1.5">
                {renderInlineText(trimmed.replace(/^###\s+/, ""))}
              </h4>
            );
          } else if (trimmed.startsWith("## ")) {
            renderedElements.push(
              <h3 key={`h3-${elementKey++}`} className="text-lg font-bold text-zinc-900 mt-5 mb-2">
                {renderInlineText(trimmed.replace(/^##\s+/, ""))}
              </h3>
            );
          } else if (trimmed.startsWith("# ")) {
            renderedElements.push(
              <h2 key={`h2-${elementKey++}`} className="text-xl font-bold text-zinc-900 mt-6 mb-2">
                {renderInlineText(trimmed.replace(/^#\s+/, ""))}
              </h2>
            );
          }
          // Blockquotes
          else if (trimmed.startsWith("> ")) {
            renderedElements.push(
              <div
                key={`bq-${elementKey++}`}
                className="pl-3 py-1.5 my-2 border-l-2 border-zinc-300 text-zinc-700 italic bg-zinc-50/60 rounded-r-md text-[14px]"
              >
                {renderInlineText(trimmed.replace(/^>\s*/, ""))}
              </div>
            );
          }
          // Bullet points
          else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
            renderedElements.push(
              <div key={`li-${elementKey++}`} className="flex items-start gap-2.5 pl-1 my-1">
                <span className="text-zinc-600 font-bold leading-relaxed shrink-0">•</span>
                <span className="flex-1 text-zinc-900">
                  {renderInlineText(trimmed.replace(/^[-*•]\s+/, ""))}
                </span>
              </div>
            );
          }
          // Numbered lists or numbered headers (like "1. Claude Pro ($20) instead of Claude Max?")
          else if (/^\d+\.\s+/.test(trimmed)) {
            const matchNum = trimmed.match(/^(\d+)\.\s+(.*)$/);
            // Check if it is a major heading styled list item
            const isHeadingItem = matchNum[2].length < 100 && (matchNum[2].includes("?") || matchNum[2].includes(":") || matchNum[2].endsWith("!"));
            
            if (isHeadingItem) {
              renderedElements.push(
                <div key={`ol-h-${elementKey++}`} className="text-lg font-bold text-zinc-900 mt-5 mb-2">
                  <span>{matchNum[1]}. </span>
                  <span>{renderInlineText(matchNum[2])}</span>
                </div>
              );
            } else {
              renderedElements.push(
                <div key={`ol-${elementKey++}`} className="flex items-start gap-2 pl-1 my-1">
                  <span className="font-semibold text-zinc-700 shrink-0">
                    {matchNum[1]}.
                  </span>
                  <span className="flex-1 text-zinc-900">
                    {renderInlineText(matchNum[2])}
                  </span>
                </div>
              );
            }
          }
          // Regular paragraph
          else {
            renderedElements.push(
              <p key={`p-${elementKey++}`} className="text-zinc-900 leading-relaxed">
                {renderInlineText(trimmed)}
              </p>
            );
          }
        }

        if (inTable && tableLines.length > 0) {
          renderedElements.push(renderTable(tableLines, `table-${elementKey++}`));
        }

        return <div key={`seg-${elementKey++}`}>{renderedElements}</div>;
      })}

      {isStreaming && (
        <span className="inline-block h-4 w-1.5 bg-black animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
}
