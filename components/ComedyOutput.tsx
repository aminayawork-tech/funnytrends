"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/app/page";

interface ComedyOutputProps {
  messages: Message[];
  streamingContent: string;
  streaming: boolean;
}

const STYLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  observational: { bg: "#FFF8F0", text: "#C45000", border: "#FFD4A8" },
  "dark humor": { bg: "#F5F0FF", text: "#6B21A8", border: "#DDD6FE" },
  roast: { bg: "#FFF0F0", text: "#B91C1C", border: "#FECACA" },
  savage: { bg: "#FFF0F0", text: "#B91C1C", border: "#FECACA" },
  absurdist: { bg: "#F0FFF4", text: "#15803D", border: "#BBF7D0" },
  surreal: { bg: "#F0FFF4", text: "#15803D", border: "#BBF7D0" },
  wordplay: { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  puns: { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  sarcastic: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  cynical: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  deadpan: { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
  dry: { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
  hyperbole: { bg: "#FFF0FE", text: "#86198F", border: "#F5D0FE" },
  wholesome: { bg: "#F0FFF4", text: "#15803D", border: "#BBF7D0" },
  "self-deprecating": { bg: "#FFF8F0", text: "#C45000", border: "#FFD4A8" },
  political: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
};

function getJokeStyle(label: string) {
  const lower = label.toLowerCase();
  for (const [key, colors] of Object.entries(STYLE_COLORS)) {
    if (lower.includes(key)) return colors;
  }
  return { bg: "#FFF3E8", text: "#FF6B00", border: "#FFDDB8" };
}

function parseJokeBlocks(text: string): Array<{ label: string; content: string } | string> {
  const lines = text.split("\n");
  const result: Array<{ label: string; content: string } | string> = [];

  for (const line of lines) {
    const boldMatch = line.match(/^\*\*([^*]+)\*\*:\s*(.+)/);
    if (boldMatch) {
      result.push({ label: boldMatch[1], content: boldMatch[2] });
    } else {
      result.push(line);
    }
  }

  return result;
}

function JokeCard({ label, content }: { label: string; content: string }) {
  const colors = getJokeStyle(label);
  return (
    <div
      className="joke-card rounded-xl border p-3 mb-2 slide-up"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <span
        className="text-xs font-bold uppercase tracking-wide mb-1 block"
        style={{ color: colors.text }}
      >
        {label}
      </span>
      <p className="text-[#1A1A1A] text-sm leading-relaxed">{content}</p>
    </div>
  );
}

function MarkdownContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const inJokesSection = useRef(false);

  const sections = content.split(/(###[^\n]+)/);

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        if (section.startsWith("###")) {
          inJokesSection.current = section.toLowerCase().includes("joke");
          const emoji = section.match(/\p{Emoji}/u)?.[0] || "";
          const title = section.replace(/###\s*/, "").replace(/\p{Emoji}/gu, "").trim();
          return (
            <div key={i} className="flex items-center gap-2 mt-4 mb-1">
              {emoji && <span className="text-xl">{emoji}</span>}
              <h3 className="font-bold text-[#1A1A1A] text-base">{title}</h3>
            </div>
          );
        }

        if (inJokesSection.current && section.trim()) {
          const blocks = parseJokeBlocks(section);
          return (
            <div key={i}>
              {blocks.map((block, j) => {
                if (typeof block === "object") {
                  return <JokeCard key={j} label={block.label} content={block.content} />;
                }
                return null;
              })}
            </div>
          );
        }

        if (section.trim()) {
          return (
            <div key={i} className="text-sm text-gray-700 leading-relaxed">
              <ReactMarkdown
                components={{
                  ul: ({ children }) => (
                    <ul className="space-y-1 my-2">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6B00] mt-0.5 flex-shrink-0">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  p: ({ children }) => <p className="mb-1">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[#1A1A1A]">{children}</strong>
                  ),
                }}
              >
                {section}
              </ReactMarkdown>
            </div>
          );
        }

        return null;
      })}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-[#FF6B00] animate-pulse ml-0.5" />
      )}
    </div>
  );
}

export default function ComedyOutput({
  messages,
  streamingContent,
  streaming,
}: ComedyOutputProps) {
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const lastAssistant = assistantMessages[assistantMessages.length - 1];

  if (streaming) {
    return (
      <div className="pb-4">
        {streamingContent ? (
          <MarkdownContent content={streamingContent} isStreaming />
        ) : (
          <LoadingState />
        )}
      </div>
    );
  }

  if (!lastAssistant) return null;

  return (
    <div className="pb-4">
      <MarkdownContent content={lastAssistant.content} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="text-center mb-2">
        <div className="text-3xl pulse-orange">🎤</div>
        <p className="text-sm text-gray-500 mt-2">Crafting your material...</p>
      </div>
      {[80, 60, 90, 70].map((w, i) => (
        <div
          key={i}
          className="h-3 bg-gray-100 rounded-full pulse-orange"
          style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
