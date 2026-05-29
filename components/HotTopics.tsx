"use client";

import { useState, useEffect, useCallback } from "react";

const REFRESH_MS = 10 * 60 * 1000;
const DISPLAY_COUNT = 6;

interface TrendsResponse {
  topics: string[];
  geo: string;
  fetchedAt: string;
  fallback?: boolean;
}

interface HotTopicsProps {
  onSelect: (topic: string) => void;
}

export default function HotTopics({ onSelect }: HotTopicsProps) {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const fetchTrends = useCallback(async () => {
    try {
      const res = await fetch("/api/trends");
      const data: TrendsResponse = await res.json();
      const shuffled = [...data.topics].sort(() => Math.random() - 0.5);
      setTopics(shuffled.slice(0, DISPLAY_COUNT));
      setFetchedAt(new Date(data.fetchedAt));
      setIsFallback(data.fallback ?? false);
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

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          {isFallback ? "Trending topics" : "Live from Google Trends"}
        </p>
        {fetchedAt && (
          <span className="text-[10px] text-gray-300">
            · {formatAge(fetchedAt)}
          </span>
        )}
        <button
          onClick={fetchTrends}
          className="text-[10px] text-gray-300 hover:text-[#FF6B00] transition-colors"
          title="Refresh trends"
        >
          ↻
        </button>
      </div>

      {loading ? (
        <SkeletonChips />
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => onSelect(t)}
              className="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FFF3E8] transition-all active:scale-95"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonChips() {
  const widths = [80, 110, 95, 120, 85, 100];
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
