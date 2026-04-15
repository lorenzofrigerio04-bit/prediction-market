/**
 * RADAR News Sources — Google News RSS, Italian Football RSS, Reddit RSS
 *
 * Produces FootballSignal[] from:
 * - Per-fixture: Google News RSS search + Reddit search RSS
 * - Floating: Italian football RSS feeds (Gazzetta, Sky Sport, Corriere, etc.)
 * - Transfer: Calciomercato monitoring via Google News RSS
 *
 * Note: RSS feeds are best-effort; failures are silent.
 */

import { fetchRSS } from "@/lib/ingestion/fetchers/rss";
import type { FootballSignal, SourceTier } from "../../types";
import { buildNewsSignalSource } from "../source-tiers";

// ---------------------------------------------------------------------------
// Italian Football RSS Feeds (floating signals)
// ---------------------------------------------------------------------------

const ITALIAN_FOOTBALL_RSS_FEEDS = [
  "https://www.gazzetta.it/rss/calcio.xml",
  "https://sport.sky.it/rss/calcio.xml",
  "https://www.corrieredellosport.it/rss/calcio.xml",
  "https://www.tuttosport.com/rss/calcio.xml",
  "https://www.football-italia.net/rss.xml",
];

/** Google News RSS for general Italian football / top stories */
const GOOGLE_NEWS_FOOTBALL_IT = [
  buildGoogleNewsUrl("calcio serie a calciomercato"),
  buildGoogleNewsUrl("calciomercato ufficiale"),
  buildGoogleNewsUrl("champions league calcio"),
];

const REDDIT_FOOTBALL_RSS = [
  "https://www.reddit.com/r/soccer/top.rss?t=day&limit=15",
  "https://www.reddit.com/r/SerieA/top.rss?t=day&limit=10",
];

// ---------------------------------------------------------------------------
// Transfer rumor Google News feeds
// ---------------------------------------------------------------------------

const TRANSFER_NEWS_FEEDS = [
  buildGoogleNewsUrl("fabrizio romano transfer calcio"),
  buildGoogleNewsUrl("calciomercato acquisti cessioni"),
  buildGoogleNewsUrl("esonero allenatore serie a"),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildGoogleNewsUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=it&gl=IT&ceid=IT:it`;
}

function buildFixtureGoogleNewsUrl(homeTeam: string, awayTeam: string, leagueName: string): string {
  const q = `"${homeTeam}" "${awayTeam}" ${leagueName} calcio`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=it&gl=IT&ceid=IT:it`;
}

function buildFixtureContextUrl(homeTeam: string, awayTeam: string): string {
  const q =
    `"${homeTeam}" "${awayTeam}" calcio ` +
    `(infortunio OR squalifica OR arbitro OR VAR OR allenatore OR conferenza OR polemica OR formazione)`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=it&gl=IT&ceid=IT:it`;
}

function buildFixtureRedditUrl(homeTeam: string, awayTeam: string): string {
  const q = `${homeTeam} ${awayTeam}`;
  return `https://www.reddit.com/search.rss?q=${encodeURIComponent(q)}&sort=new&t=week&limit=5`;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function classifyUrl(url: string): { id: "reddit" | "google-news-rss"; tier: SourceTier; name: string; reliability: number } {
  if (url.includes("reddit.com")) {
    return { id: "reddit", tier: 3, name: "Reddit", reliability: 0.5 };
  }
  const signalSource = buildNewsSignalSource(url);
  return {
    id: signalSource.id === "reddit" ? "reddit" : "google-news-rss",
    tier: signalSource.tier,
    name: signalSource.name,
    reliability: signalSource.reliability,
  };
}

function articleToSignal(
  title: string,
  url: string,
  publishedAt: Date | undefined,
  content: string,
  type: FootballSignal["type"],
  matchId?: string,
  teamIds?: string[]
): FootballSignal {
  const source = classifyUrl(url);
  return {
    id: `rss-${Buffer.from(url).toString("base64").slice(0, 16)}-${Date.now()}`,
    type,
    source: {
      id: source.id,
      tier: source.tier,
      name: source.name,
      reliability: source.reliability,
    },
    timestamp: publishedAt?.toISOString() ?? new Date().toISOString(),
    headline: title.slice(0, 200),
    content: content.slice(0, 500),
    sourceUrl: url,
    confidence: source.reliability * 0.8,
    matchId,
    teamIds,
    tags: buildTags(type, title),
    payload: { fetchedAt: new Date().toISOString() },
  };
}

function buildTags(type: FootballSignal["type"], headline: string): string[] {
  const tags: string[] = [type];
  const t = headline.toLowerCase();
  if (/derby|clasico|stracittadin/.test(t)) tags.push("derby");
  if (/infortun|injured|ko/.test(t)) tags.push("injury");
  if (/transfer|acquist|cession|rumor/.test(t)) tags.push("transfer");
  if (/esonero|licenziat|fired|sacked/.test(t)) tags.push("sacking");
  if (/var|rigore|polemi/.test(t)) tags.push("controversy");
  return tags;
}

// ---------------------------------------------------------------------------
// Per-fixture news
// ---------------------------------------------------------------------------

/**
 * Fetch news signals for a specific upcoming fixture.
 * Returns FootballSignal[] tagged as "news" or "social".
 */
export async function fetchFixtureNewsSignals(
  homeTeam: string,
  awayTeam: string,
  leagueName: string,
  _fixtureDate: string
): Promise<FootballSignal[]> {
  const signals: FootballSignal[] = [];

  const [newsArticles, contextArticles, redditArticles] = await Promise.all([
    fetchRSS([buildFixtureGoogleNewsUrl(homeTeam, awayTeam, leagueName)], "RSS_MEDIA").catch(() => []),
    fetchRSS([buildFixtureContextUrl(homeTeam, awayTeam)], "RSS_MEDIA").catch(() => []),
    fetchRSS([buildFixtureRedditUrl(homeTeam, awayTeam)], "RSS_MEDIA").catch(() => []),
  ]);

  const seen = new Set<string>();

  for (const article of [...newsArticles, ...contextArticles]) {
    if (!article.title || !article.url) continue;
    const key = article.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    signals.push(
      articleToSignal(
        article.title,
        article.url,
        article.publishedAt,
        article.content ?? "",
        "news"
      )
    );
    if (signals.length >= 8) break;
  }

  for (const article of redditArticles.slice(0, 3)) {
    if (!article.title || !article.url) continue;
    signals.push(
      articleToSignal(
        article.title,
        article.url,
        article.publishedAt,
        article.content ?? "",
        "social"
      )
    );
  }

  return signals;
}

// ---------------------------------------------------------------------------
// Floating (non-match-specific) news
// ---------------------------------------------------------------------------

/**
 * Fetch floating news signals: general Italian football news, transfers, rumors.
 * These are NOT tied to a specific match but enrich the BRAIN's context.
 */
export async function fetchFloatingNewsSignals(): Promise<FootballSignal[]> {
  const signals: FootballSignal[] = [];

  // Parallel fetch from all feeds (best-effort)
  const allFeedUrls = [
    ...ITALIAN_FOOTBALL_RSS_FEEDS,
    ...GOOGLE_NEWS_FOOTBALL_IT,
    ...TRANSFER_NEWS_FEEDS,
  ];

  const results = await Promise.allSettled(
    allFeedUrls.map((url) => fetchRSS([url], "RSS_MEDIA"))
  );

  const redditResults = await Promise.allSettled(
    REDDIT_FOOTBALL_RSS.map((url) => fetchRSS([url], "RSS_MEDIA"))
  );

  const allArticles = [
    ...results.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
    ...redditResults.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
  ];

  const seen = new Set<string>();

  for (const article of allArticles) {
    if (!article.title || !article.url) continue;
    const key = article.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);

    // Classify signal type from headline keywords
    const type = classifyHeadlineType(article.title);

    signals.push(
      articleToSignal(
        article.title,
        article.url,
        article.publishedAt,
        article.content ?? "",
        type
      )
    );

    if (signals.length >= 40) break;
  }

  return signals;
}

// ---------------------------------------------------------------------------
// Headline classification
// ---------------------------------------------------------------------------

function classifyHeadlineType(headline: string): FootballSignal["type"] {
  const t = headline.toLowerCase();
  if (/trasfer|acquist|cession|ufficiale.*arriv|rinnov|calciomercato|signa/.test(t)) return "transfer_official";
  if (/trattativ|interest|offert|rumor|vuole|sogno|piace/.test(t)) return "transfer_rumor";
  if (/esonerat|licenziat|dimettu|nuovo.*allena|cambio.*panchina/.test(t)) return "coach_change";
  if (/infortun|fermato|ko|assent|indisponibile/.test(t)) return "injury";
  if (/squalific|espuls|cartellino|diffida/.test(t)) return "suspension";
  if (/var|rigore.*annullat|arbitra|polemica/.test(t)) return "var_incident";
  if (/reddit|forum|communit|tifosi/.test(t)) return "social";
  if (/conferenza|dichiar|parole|intervista|dice/.test(t)) return "press_conference";
  return "news";
}
