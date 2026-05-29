"use client";

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

// Renders the raw text line-by-line — no section tracking, no refs, no state.
function ContentRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const lines = content.split("\n");

  const elements = lines.map((line, i) => {
    // Section header: ### Title
    if (/^###\s/.test(line)) {
      const title = line.replace(/^###\s*/, "").trim();
      if (!title) return null;
      return (
        <h3
          key={i}
          className="font-bold text-[#1A1A1A] text-base mt-5 mb-2 pb-1 border-b border-gray-100"
        >
          {title}
        </h3>
      );
    }

    // Joke card: **Label:** text
    const jokeMatch = line.match(/^\*\*([^*]+)\*\*:\s*(.+)/);
    if (jokeMatch) {
      const colors = getJokeStyle(jokeMatch[1]);
      return (
        <div
          key={i}
          className="rounded-xl border p-3 mb-2"
          style={{ backgroundColor: colors.bg, borderColor: colors.border }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wide mb-1 block"
            style={{ color: colors.text }}
          >
            {jokeMatch[1]}
          </span>
          <p className="text-[#1A1A1A] text-sm leading-relaxed">{jokeMatch[2]}</p>
        </div>
      );
    }

    // Bullet point: - text or * text
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      // Strip any leading **bold** from bullet text (Next Moves uses **Bold:** desc)
      const text = bulletMatch[1].replace(/^\*\*([^*]+)\*\*:?\s*/, "$1: ");
      return (
        <div key={i} className="flex items-start gap-2 text-sm text-gray-700 mb-1">
          <span className="text-[#FF6B00] mt-0.5 flex-shrink-0 select-none">•</span>
          <span>{text}</span>
        </div>
      );
    }

    // Horizontal rule — skip
    if (/^---+$/.test(line.trim())) return null;

    // Plain text (non-empty)
    if (line.trim()) {
      return (
        <p key={i} className="text-sm text-gray-700 leading-relaxed mb-1">
          {line}
        </p>
      );
    }

    return null;
  });

  return (
    <div className="pb-6">
      {elements}
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
