import { NextResponse } from "next/server";

const GEO = "US";
const RSS_URL = `https://trends.google.com/trending/rss?geo=${GEO}`;
const REVALIDATE_SECONDS = 600; // 10 minutes

function parseItemTitles(xml: string): string[] {
  // Skip the channel <title> tag — only grab titles inside <item> blocks
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items
    .map((item) => {
      const match = item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>|<title>([^<]+)<\/title>/);
      return (match?.[1] ?? match?.[2] ?? "").trim();
    })
    .filter(Boolean)
    .slice(0, 12); // cap at 12 so the UI can sample from them
}

export async function GET() {
  try {
    const res = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FunnyTrends/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      throw new Error(`Google Trends RSS responded with ${res.status}`);
    }

    const xml = await res.text();
    const topics = parseItemTitles(xml);

    if (topics.length === 0) {
      throw new Error("No items parsed from RSS");
    }

    return NextResponse.json(
      { topics, geo: GEO, fetchedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=60`,
        },
      }
    );
  } catch (err) {
    console.error("[/api/trends]", err);
    // Return fallback topics so the UI never breaks
    return NextResponse.json(
      {
        topics: FALLBACK_TOPICS,
        geo: GEO,
        fetchedAt: new Date().toISOString(),
        fallback: true,
      },
      { status: 200 }
    );
  }
}

const FALLBACK_TOPICS = [
  "AI taking over jobs",
  "Avocado toast economy",
  "Doomscrolling at 3am",
  "Gen Z vs Millennials",
  "Self-checkout machines",
  "Elon Musk tweets",
];
