import { NextResponse } from "next/server";

const GEO = "US";
const REVALIDATE_SECONDS = 600;

// ── Google Trends ──────────────────────────────────────────────────────────
async function fetchGoogleTrends(): Promise<string[]> {
  const res = await fetch(`https://trends.google.com/trending/rss?geo=${GEO}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FunnyTrends/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Google Trends ${res.status}`);
  const xml = await res.text();

  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items
    .map((item) => {
      const m = item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>|<title>([^<]+)<\/title>/);
      return (m?.[1] ?? m?.[2] ?? "").trim();
    })
    .filter(Boolean)
    .slice(0, 12);
}

// ── X / Twitter trends via Trends24.in ────────────────────────────────────
async function fetchXTrends(): Promise<string[]> {
  const res = await fetch("https://trends24.in/united-states/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Trends24 ${res.status}`);
  const html = await res.text();

  // Each trend sits in <li><a href="...">Topic</a>...</li> inside trend-card lists
  const listBlocks = html.match(/<ol[^>]*class="[^"]*trend-card__list[^"]*"[^>]*>([\s\S]*?)<\/ol>/g) ?? [];
  const topics: string[] = [];

  for (const block of listBlocks) {
    const anchors = block.match(/<a[^>]*>([^<]+)<\/a>/g) ?? [];
    for (const a of anchors) {
      const text = a.replace(/<[^>]+>/g, "").trim();
      if (text && !text.startsWith("#") === false || text) {
        // Keep hashtags and plain words, skip empty
        if (text.length > 1) topics.push(text.replace(/^#/, ""));
      }
    }
    if (topics.length >= 15) break;
  }

  return [...new Set(topics)].slice(0, 12);
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function GET() {
  const results = await Promise.allSettled([fetchGoogleTrends(), fetchXTrends()]);

  const googleTopics = results[0].status === "fulfilled" ? results[0].value : [];
  const xTopics = results[1].status === "fulfilled" ? results[1].value : [];

  // Interleave: one from each source alternately, deduplicated
  const seen = new Set<string>();
  const combined: Array<{ topic: string; source: "google" | "x" }> = [];

  const maxLen = Math.max(googleTopics.length, xTopics.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < googleTopics.length) {
      const t = googleTopics[i];
      if (!seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); combined.push({ topic: t, source: "google" }); }
    }
    if (i < xTopics.length) {
      const t = xTopics[i];
      if (!seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); combined.push({ topic: t, source: "x" }); }
    }
  }

  const usedFallback = combined.length === 0;
  const finalTopics = usedFallback
    ? FALLBACK_TOPICS.map((t) => ({ topic: t, source: "google" as const }))
    : combined;

  return NextResponse.json(
    {
      topics: finalTopics,
      fetchedAt: new Date().toISOString(),
      sources: {
        google: googleTopics.length > 0,
        x: xTopics.length > 0,
      },
      fallback: usedFallback,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=60`,
      },
    }
  );
}

const FALLBACK_TOPICS = [
  "AI taking over jobs",
  "Avocado toast economy",
  "Doomscrolling at 3am",
  "Gen Z vs Millennials",
  "Self-checkout machines",
  "Elon Musk tweets",
];
