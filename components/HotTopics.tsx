"use client";

import { useState, useEffect, useCallback } from "react";

const REFRESH_MS = 10 * 60 * 1000;
const DISPLAY_COUNT = 8;

interface TrendItem {
  topic: string;
  source: "google" | "x";
}

interface TrendsResponse {
  topics: TrendItem[];
  fetchedAt: string;
  sources: { google: boolean; x: boolean };
  fallback?: boolean;
}

interface HotTopicsProps {
  onSelect: (topic: string) => void;
}

export default function HotTopics({ onSelect }: HotTopicsProps) {
  const [topics, setTopics] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [sources, setSources] = useState({ google: false, x: false });

  const fetchTrends = useCallback(async () => {
    try {
      const res = await fetch("/api/trends");
      const data: TrendsResponse = await res.json();
      const shuffled = [...data.topics].sort(() => Math.random() - 0.5);
      setTopics(shuffled.slice(0, DISPLAY_COUNT));
      setFetchedAt(new Date(data.fetchedAt));
      setSources(data.sources ?? { google: false, x: false });
    } catch {
      // keep existing topics on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends();
    const id = setInterval(fetchTrends, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchTrends]);

  const sourceLabel = sources.google && sources.x
    ? "Google + X trends"
    : sources.google
    ? "Google Trends"
    : sources.x
    ? "X Trends"
    : "Trending topics";

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          {sourceLabel}
        </p>
        {fetchedAt && (
          <span className="text-[10px] text-gray-300">· {formatAge(fetchedAt)}</span>
        )}
        <button
          onClick={fetchTrends}
          className="text-[10px] text-gray-300 hover:text-[#FF6B00] transition-colors"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {loading ? (
        <SkeletonChips />
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {topics.map((item) => (
            <button
              key={item.topic}
              onClick={() => onSelect(item.topic)}
              className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 rounded-full pl-3 pr-3 py-2 text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FFF3E8] transition-all active:scale-95"
            >
              <span
                className="text-[9px] font-bold uppercase tracking-wide opacity-40"
              >
                {item.source === "x" ? "X" : "G"}
              </span>
              {item.topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonChips() {
  const widths = [80, 110, 95, 120, 85, 100, 90, 115];
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-9 rounded-full bg-gray-100 animate-pulse"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

function formatAge(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}
