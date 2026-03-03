"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";

interface OracleMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function OracleMessage({
  role,
  content,
  isStreaming = false,
}: OracleMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      data-role={role}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[#2f2f2f] text-white border border-white/10"
            : "bg-[#1e1e1e] text-[#ececec] border border-white/[0.08]"
        }`}
      >
        {isUser ? (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="oracle-report prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-[#ececec] prose-headings:text-[#ececec] text-[#ececec]">
            <ReactMarkdown>{content || (isStreaming ? "…" : "")}</ReactMarkdown>
            {isStreaming && (
              <span
                className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse"
                aria-hidden
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(OracleMessage);
