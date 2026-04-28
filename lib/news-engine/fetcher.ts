/**
 * Fetches raw football news from multiple sources:
 * 1. SourceArticle table (already ingested via RSS/NewsAPI pipeline)
 * 2. API-Football for player/team news (if key available)
 * 3. Direct football RSS feeds
 */

import { prisma } from "@/lib/prisma";
import type { RawNewsInput } from "./types";

const FOOTBALL_RSS_FEEDS = [
  { url: "https://www.gazzetta.it/rss/home.xml", id: "gazzetta" },
  { url: "https://www.corrieredellosport.it/rss/", id: "corrieredellosport" },
  { url: "https://www.tuttosport.com/rss/calcio.xml", id: "tuttosport" },
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", id: "bbc-sport" },
  { url: "https://www.football365.com/feed", id: "football365" },
];

const FOOTBALL_KEYWORDS = [
  "calcio", "football", "soccer", "serie a", "champions", "juventus", "inter",
  "milan", "napoli", "roma", "lazio", "atalanta", "fiorentina", "torino",
  "premier league", "la liga", "bundesliga", "messi", "ronaldo", "mbappé",
  "allenatore", "gol", "partita", "trasferimento", "mercato", "nazionale",
  "mondiale", "europeo", "coppa italia", "arbitro", "infortunio",
];

function isFootballRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return FOOTBALL_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Fetch recent articles already stored in SourceArticle table */
async function fetchFromSourceArticles(limit = 40): Promise<RawNewsInput[]> {
  try {
    const hoursBack = 48;
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const articles = await prisma.sourceArticle.findMany({
      where: {
        fetchedAt: { gte: since },
        OR: [
          { title: { contains: "calcio", mode: "insensitive" } },
          { title: { contains: "football", mode: "insensitive" } },
          { title: { contains: "serie a", mode: "insensitive" } },
          { title: { contains: "champions", mode: "insensitive" } },
          { title: { contains: "milan", mode: "insensitive" } },
          { title: { contains: "inter", mode: "insensitive" } },
          { title: { contains: "juventus", mode: "insensitive" } },
          { title: { contains: "napoli", mode: "insensitive" } },
          { title: { contains: "roma", mode: "insensitive" } },
          { title: { contains: "mercato", mode: "insensitive" } },
        ],
      },
      orderBy: { fetchedAt: "desc" },
      take: limit,
    });

    return articles.map((a) => ({
      title: a.title,
      content: a.content ?? "",
      url: a.canonicalUrl,
      publishedAt: a.publishedAt ?? a.fetchedAt,
      sourceId: a.sourceType,
    }));
  } catch (err) {
    console.warn("[news-engine/fetcher] SourceArticle fetch failed:", err);
    return [];
  }
}

/** Fetch from football RSS feeds directly */
async function fetchFromRSS(): Promise<RawNewsInput[]> {
  const results: RawNewsInput[] = [];

  for (const feed of FOOTBALL_RSS_FEEDS) {
    try {
      const Parser = (await import("rss-parser")).default;
      const parser = new Parser({ timeout: 8000 });
      const parsed = await parser.parseURL(feed.url);

      for (const item of (parsed.items ?? []).slice(0, 10)) {
        const title = item.title ?? "";
        const content = item.contentSnippet ?? item.content ?? item.summary ?? "";
        const url = item.link ?? item.guid ?? "";

        if (!title || !url) continue;
        if (!isFootballRelated(title + " " + content)) continue;

        results.push({
          title,
          content: content.slice(0, 2000),
          url,
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
          sourceId: feed.id,
        });
      }
    } catch {
      // Feed non raggiungibile, continuiamo
    }
  }

  return results;
}

/** Fetch from API-Football headlines (if key available) */
async function fetchFromAPIFootball(): Promise<RawNewsInput[]> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      "https://v3.football.api-sports.io/fixtures?league=135&season=2024&last=10",
      {
        headers: {
          "x-apisports-key": apiKey,
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) return [];
    interface APIFootballFixture {
      fixture: { date: string; id: number; status: { long: string } };
      teams: { home: { name: string }; away: { name: string } };
      goals: { home: number | null; away: number | null };
    }
    const data = await res.json() as { response?: APIFootballFixture[] };

    const articles: RawNewsInput[] = [];
    for (const match of (data.response ?? []).slice(0, 8)) {
      const home = match.teams?.home?.name ?? "?";
      const away = match.teams?.away?.name ?? "?";
      const goalsHome = match.goals?.home ?? 0;
      const goalsAway = match.goals?.away ?? 0;
      const status = match.fixture?.status?.long ?? "";
      const date = match.fixture?.date;

      const title = `${home} ${goalsHome}-${goalsAway} ${away} — ${status}`;
      const content = `Partita di Serie A: ${home} vs ${away}. Risultato: ${goalsHome}-${goalsAway}. Stato: ${status}.`;

      articles.push({
        title,
        content,
        url: `https://www.api-football.com/fixture/${match.fixture?.id ?? "unknown"}`,
        publishedAt: date ? new Date(date) : new Date(),
        sourceId: "api-football",
      });
    }

    return articles;
  } catch {
    return [];
  }
}

/** Fetch recent platform events for analytics content */
async function fetchPlatformEventData(): Promise<RawNewsInput[]> {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "OPEN",
        hidden: false,
        category: { in: ["sport", "calcio", "football", "SPORT"] },
      },
      orderBy: { totalCredits: "desc" },
      take: 10,
      include: {
        _count: { select: { Prediction: true, Trade: true } },
      },
    });

    return events.map((e) => {
      const yesPct = e.probability ? Math.round(e.probability * 100) : 50;
      const noPct = 100 - yesPct;
      return {
        title: `[PLATFORM DATA] ${e.title}`,
        content: `Evento sulla piattaforma: "${e.title}". Probabilità attuale: Sì ${yesPct}% / No ${noPct}%. Predizioni totali: ${e._count.Prediction}. Trade: ${e._count.Trade}. Crediti in gioco: ${e.totalCredits ?? 0}. Categoria: ${e.category}.`,
        url: `https://predictionmaster.app/eventi/${e.id}`,
        publishedAt: e.createdAt,
        sourceId: "platform",
      };
    });
  } catch {
    return [];
  }
}

/** Deduplicate by URL */
function deduplicate(articles: RawNewsInput[]): RawNewsInput[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

/** Main fetcher: combines all sources */
export async function fetchAllNewsInputs(): Promise<{
  general: RawNewsInput[];
  platform: RawNewsInput[];
}> {
  const [fromDB, fromRSS, fromAPIFootball, platform] = await Promise.allSettled([
    fetchFromSourceArticles(30),
    fetchFromRSS(),
    fetchFromAPIFootball(),
    fetchPlatformEventData(),
  ]);

  const general = deduplicate([
    ...(fromDB.status === "fulfilled" ? fromDB.value : []),
    ...(fromRSS.status === "fulfilled" ? fromRSS.value : []),
    ...(fromAPIFootball.status === "fulfilled" ? fromAPIFootball.value : []),
  ]);

  const platformData =
    platform.status === "fulfilled" ? platform.value : [];

  return { general, platform: platformData };
}
