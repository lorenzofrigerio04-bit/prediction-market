/**
 * Journalist & Source Tier System.
 *
 * Every information source gets classified into tiers:
 * - Tier 1: Official / highly reliable (APIs, club announcements, top-tier journalists)
 * - Tier 2: Reputable journalists, major news outlets
 * - Tier 3: Aggregators, social accounts, rumors
 *
 * The tier affects:
 * - Signal confidence score
 * - Whether an event gets generated immediately vs put on watchlist
 * - Resolution eligibility (only Tier 1 sources can be primary resolution)
 */

import type { SignalSource, SignalSourceId, SourceTier } from "../types";

// ---------------------------------------------------------------------------
// Built-in API sources (always Tier 1)
// ---------------------------------------------------------------------------

export const API_SOURCES: Record<string, SignalSource> = {
  "football-data-org": {
    id: "football-data-org",
    tier: 1,
    name: "football-data.org",
    reliability: 0.99,
  },
  "api-football": {
    id: "api-football",
    tier: 1,
    name: "API-Football",
    reliability: 0.98,
  },
  "odds-api": {
    id: "odds-api",
    tier: 1,
    name: "The Odds API",
    reliability: 0.95,
  },
};

// ---------------------------------------------------------------------------
// Known journalist/account tiers (extensible)
// ---------------------------------------------------------------------------

interface JournalistProfile {
  name: string;
  handle?: string;
  tier: SourceTier;
  reliability: number;
  specialties: string[];
  /** ISO country codes this journalist is authoritative for */
  countries: string[];
}

const JOURNALIST_REGISTRY: JournalistProfile[] = [
  // ─── Tier 1: The elite. When they say it, it's done. ─────────
  { name: "Fabrizio Romano", handle: "@FabrizioRomano", tier: 1, reliability: 0.95, specialties: ["transfers"], countries: ["*"] },
  { name: "David Ornstein", handle: "@David_Ornstein", tier: 1, reliability: 0.94, specialties: ["transfers", "contracts"], countries: ["GB"] },
  { name: "Gianluca Di Marzio", handle: "@DiMarzio", tier: 1, reliability: 0.92, specialties: ["transfers", "serie-a"], countries: ["IT"] },
  { name: "Matteo Moretto", handle: "@MatteMoretto", tier: 1, reliability: 0.91, specialties: ["transfers", "serie-a", "la-liga"], countries: ["IT", "ES"] },

  // ─── Tier 2: Reputable, usually right, sometimes premature ───
  { name: "Nicolò Schira", handle: "@NicoSchira", tier: 2, reliability: 0.78, specialties: ["transfers", "contracts"], countries: ["IT"] },
  { name: "Alfredo Pedullà", handle: "@AlfredoPedulla", tier: 2, reliability: 0.80, specialties: ["transfers", "serie-a"], countries: ["IT"] },
  { name: "Sky Sport Italia", handle: "@SkySport", tier: 2, reliability: 0.85, specialties: ["general", "serie-a"], countries: ["IT"] },
  { name: "Gazzetta dello Sport", handle: "@Gaboretto", tier: 2, reliability: 0.80, specialties: ["general", "serie-a"], countries: ["IT"] },
  { name: "The Athletic", handle: "@TheAthletic", tier: 2, reliability: 0.88, specialties: ["general"], countries: ["GB", "US"] },
  { name: "L'Équipe", handle: "@laborat", tier: 2, reliability: 0.82, specialties: ["general", "ligue-1"], countries: ["FR"] },
  { name: "Marca", handle: "@marca", tier: 2, reliability: 0.80, specialties: ["general", "la-liga"], countries: ["ES"] },
  { name: "Kicker", handle: "@kaboror", tier: 2, reliability: 0.82, specialties: ["general", "bundesliga"], countries: ["DE"] },
  { name: "ESPN FC", handle: "@ESPNFC", tier: 2, reliability: 0.80, specialties: ["general"], countries: ["*"] },
  { name: "BBC Sport", handle: "@BBCSport", tier: 2, reliability: 0.90, specialties: ["general"], countries: ["GB"] },
  { name: "Guardian Football", handle: "@guardian_sport", tier: 2, reliability: 0.85, specialties: ["general"], countries: ["GB"] },

  // ─── Tier 3: Aggregators, fan accounts, mixed reliability ────
  { name: "Calciomercato.com", handle: "@calciomercatoit", tier: 3, reliability: 0.60, specialties: ["transfers", "rumors"], countries: ["IT"] },
  { name: "TuttoMercatoWeb", handle: "@TuttoMercatoWeb", tier: 3, reliability: 0.58, specialties: ["transfers", "rumors"], countries: ["IT"] },
  { name: "Football Italia", handle: "@footballitalia", tier: 3, reliability: 0.65, specialties: ["serie-a"], countries: ["IT"] },
  { name: "r/soccer", tier: 3, reliability: 0.45, specialties: ["general", "rumors"], countries: ["*"] },
];

// ---------------------------------------------------------------------------
// News outlet domain → tier mapping
// ---------------------------------------------------------------------------

const DOMAIN_TIERS: Record<string, { tier: SourceTier; reliability: number }> = {
  // Tier 1
  "uefa.com": { tier: 1, reliability: 0.99 },
  "fifa.com": { tier: 1, reliability: 0.99 },
  "legaseriea.it": { tier: 1, reliability: 0.99 },
  "premierleague.com": { tier: 1, reliability: 0.99 },
  "laliga.com": { tier: 1, reliability: 0.99 },
  "bundesliga.com": { tier: 1, reliability: 0.99 },

  // Tier 2
  "bbc.co.uk": { tier: 2, reliability: 0.90 },
  "bbc.com": { tier: 2, reliability: 0.90 },
  "theguardian.com": { tier: 2, reliability: 0.85 },
  "theathletic.com": { tier: 2, reliability: 0.88 },
  "espn.com": { tier: 2, reliability: 0.82 },
  "skysport.it": { tier: 2, reliability: 0.84 },
  "sky.it": { tier: 2, reliability: 0.84 },
  "gazzetta.it": { tier: 2, reliability: 0.78 },
  "corrieredellosport.it": { tier: 2, reliability: 0.75 },
  "tuttosport.com": { tier: 2, reliability: 0.73 },
  "marca.com": { tier: 2, reliability: 0.78 },
  "as.com": { tier: 2, reliability: 0.76 },
  "lequipe.fr": { tier: 2, reliability: 0.82 },
  "kicker.de": { tier: 2, reliability: 0.82 },
  "sport.de": { tier: 2, reliability: 0.75 },

  // Tier 3
  "calciomercato.com": { tier: 3, reliability: 0.58 },
  "tuttomercatoweb.com": { tier: 3, reliability: 0.55 },
  "footballitalia.net": { tier: 3, reliability: 0.62 },
  "sempremilan.com": { tier: 3, reliability: 0.50 },
  "juvelive.it": { tier: 3, reliability: 0.48 },
  "reddit.com": { tier: 3, reliability: 0.40 },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getApiSource(id: SignalSourceId): SignalSource {
  return API_SOURCES[id] ?? { id, tier: 3, name: id, reliability: 0.5 };
}

export function classifySourceByDomain(domain: string): { tier: SourceTier; reliability: number } {
  const clean = domain.replace(/^www\./, "").toLowerCase();
  if (DOMAIN_TIERS[clean]) return DOMAIN_TIERS[clean];

  // Check partial matches (e.g. "sport.bbc.co.uk" → "bbc.co.uk")
  for (const [pattern, value] of Object.entries(DOMAIN_TIERS)) {
    if (clean.endsWith(pattern)) return value;
  }

  return { tier: 3, reliability: 0.4 };
}

export function classifySourceByAuthor(authorName: string): JournalistProfile | null {
  const lower = authorName.toLowerCase();
  return (
    JOURNALIST_REGISTRY.find(
      (j) =>
        j.name.toLowerCase() === lower ||
        (j.handle && j.handle.toLowerCase().replace("@", "") === lower.replace("@", ""))
    ) ?? null
  );
}

/**
 * Build a SignalSource for a news article based on domain and optionally author.
 */
export function buildNewsSignalSource(
  url: string,
  authorName?: string
): SignalSource {
  let domain: string;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    domain = "unknown";
  }

  const domainClass = classifySourceByDomain(domain);
  const journalist = authorName ? classifySourceByAuthor(authorName) : null;

  // If journalist is known, use the better of journalist vs domain tier
  const tier = journalist ? Math.min(journalist.tier, domainClass.tier) as SourceTier : domainClass.tier;
  const reliability = journalist
    ? Math.max(journalist.reliability, domainClass.reliability)
    : domainClass.reliability;

  return {
    id: "google-news-rss",
    tier,
    name: journalist?.name ?? domain,
    reliability,
  };
}

export function getJournalistRegistry(): readonly JournalistProfile[] {
  return JOURNALIST_REGISTRY;
}
