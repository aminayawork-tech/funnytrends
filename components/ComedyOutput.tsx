"use client";

import { useState, useCallback } from "react";
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

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }, []);

  return { copiedKey, copy };
}

function CopyButton({ id, text, copiedKey, onCopy }: {
  id: string;
  text: string;
  copiedKey: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  const copied = copiedKey === id;
  return (
    <button
      onClick={() => onCopy(id, text)}
      className="flex-shrink-0 text-[10px] font-medium px-2 py-1 rounded-lg transition-all"
      style={copied
        ? { background: "#F0FFF4", color: "#15803D" }
        : { background: "rgba(0,0,0,0.04)", color: "#9CA3AF" }
      }
      title="Copy"
    >
      {copied ? "Saved" : "Copy"}
    </button>
  );
}

type ParsedSection = {
  title: string | null;
  lines: string[];
};

function parseSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection = { title: null, lines: [] };

  for (const line of content.split("\n")) {
    if (/^###\s/.test(line)) {
      if (current.title !== null || current.lines.some((l) => l.trim())) {
        sections.push(current);
      }
      current = { title: line.replace(/^###\s*/, "").trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.title !== null || current.lines.some((l) => l.trim())) {
    sections.push(current);
  }
  return sections;
}

function sectionPlainText(section: ParsedSection): string {
  const lines = section.lines
    .filter((l) => !/^---+$/.test(l.trim()))
    .map((l) => {
      const jokeMatch = l.match(/^\*\*([^*]+)\*\*:\s*(.+)/);
      if (jokeMatch) return `${jokeMatch[1]}: ${jokeMatch[2]}`;
      const bulletMatch = l.match(/^[-*]\s+(.+)/);
      if (bulletMatch) return `• ${bulletMatch[1].replace(/^\*\*([^*]+)\*\*:?\s*/, "$1: ")}`;
      return l;
    })
    .filter(Boolean);

  return section.title ? `${section.title}\n\n${lines.join("\n")}` : lines.join("\n");
}

function ContentRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const { copiedKey, copy } = useCopy();
  const sections = parseSections(content);

  return (
    <div className="pb-6">
      {sections.map((section, si) => (
        <div key={si}>
          {section.title && (
            <div className="flex items-center justify-between gap-2 mt-5 mb-2 pb-1 border-b border-gray-100">
              <h3 className="font-bold text-[#1A1A1A] text-base">{section.title}</h3>
              {!isStreaming && (
                <CopyButton
                  id={`section-${si}`}
                  text={sectionPlainText(section)}
                  copiedKey={copiedKey}
                  onCopy={copy}
                />
              )}
            </div>
          )}

          {section.lines.map((line, li) => {
            const jokeMatch = line.match(/^\*\*([^*]+)\*\*:\s*(.+)/);
            if (jokeMatch) {
              const colors = getJokeStyle(jokeMatch[1]);
              const jokeKey = `joke-${si}-${li}`;
              return (
                <div
                  key={li}
                  className="rounded-xl border p-3 mb-2"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-xs font-bold uppercase tracking-wide mb-1 block"
                        style={{ color: colors.text }}
                      >
                        {jokeMatch[1]}
                      </span>
                      <p className="text-[#1A1A1A] text-sm leading-relaxed">{jokeMatch[2]}</p>
                    </div>
                    {!isStreaming && (
                      <CopyButton
                        id={jokeKey}
                        text={`${jokeMatch[1]}: ${jokeMatch[2]}`}
                        copiedKey={copiedKey}
                        onCopy={copy}
                      />
                    )}
                  </div>
                </div>
              );
            }

            const bulletMatch = line.match(/^[-*]\s+(.+)/);
            if (bulletMatch) {
              const text = bulletMatch[1].replace(/^\*\*([^*]+)\*\*:?\s*/, "$1: ");
              return (
                <div key={li} className="flex items-start gap-2 text-sm text-gray-700 mb-1">
                  <span className="text-[#FF6B00] mt-0.5 flex-shrink-0 select-none">•</span>
                  <span>{text}</span>
                </div>
              );
            }

            if (/^---+$/.test(line.trim())) return null;

            if (line.trim()) {
              return (
                <p key={li} className="text-sm text-gray-700 leading-relaxed mb-1">
                  {line}
                </p>
              );
            }

            return null;
          })}
        </div>
      ))}

      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-[#FF6B00] animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
}

export default function ComedyOutput({
  messages,
  streamingContent,
  streaming,
}: ComedyOutputProps) {
  if (streaming) {
    return streamingContent ? (
      <ContentRenderer content={streamingContent} isStreaming />
    ) : (
      <LoadingState />
    );
  }

  const lastAssistant = messages.filter((m) => m.role === "assistant").at(-1);
  if (!lastAssistant?.content) return null;

  return <ContentRenderer content={lastAssistant.content} />;
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3 py-6">
      <p className="text-sm text-gray-400 text-center pulse-orange">
        Crafting your material...
      </p>
      {[80, 55, 90, 65, 75].map((w, i) => (
        <div
          key={i}
          className="h-3 bg-gray-100 rounded-full pulse-orange"
          style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
