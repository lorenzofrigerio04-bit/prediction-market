/**
 * Italy-first source prioritization.
 * Whitelist and boost for Italian news sources (ANSA, Corriere, Repubblica, etc.).
 */

/** Domains or source names considered Italy-first (lowercase). */
export const ITALY_SOURCE_DOMAINS = new Set([
  "ansa.it",
  "corriere.it",
  "repubblica.it",
  "ilsole24ore.com",
  "agi.it",
  "rainews.it",
  "tgcom24.mediaset.it",
  "adnkronos.com",
  "ilmessaggero.it",
  "lastampa.it",
  "ilfattoquotidiano.it",
  "fanpage.it",
  "open.online",
  "europa.today",
  "tg24.sky.it",
  "sport.sky.it",
  "gazzetta.it",
  "corrieredellosport.it",
  "tuttosport.com",
]);

/** Source name substrings that indicate Italy-first (lowercase). */
export const ITALY_SOURCE_NAMES = new Set([
  "ansa",
  "corriere",
  "repubblica",
  "sole 24 ore",
  "agi",
  "rainews",
  "mediaset",
  "adnkronos",
  "messaggero",
  "stampa",
  "fatto quotidiano",
  "fanpage",
  "gazzetta",
  "corriere dello sport",
  "tuttosport",
  "sky tg24",
  "sky sport",
]);

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Returns true if the candidate is from an Italy-first source.
 */
export function isItalySource(url: string, sourceName?: string | null): boolean {
  const host = getHostname(url);
  if (host) {
    const baseDomain = host.split(".").slice(-2).join(".");
    if (ITALY_SOURCE_DOMAINS.has(host) || ITALY_SOURCE_DOMAINS.has(baseDomain)) {
      return true;
    }
  }
  const name = (sourceName ?? "").toLowerCase();
  for (const key of ITALY_SOURCE_NAMES) {
    if (name.includes(key)) return true;
  }
  return false;
}

/**
 * Boost score for Italy sources (1.0 = no boost, >1 = prioritize).
 */
export const ITALY_SOURCE_BOOST = 1.5;
