/**
 * Criteri di risolvibilità e euristiche per la verifica candidati (Fase 2).
 *
 * Checklist risolvibilità:
 * 1. Esito binario (SÌ/NO) – euristica da titolo/snippet
 * 2. Esistenza di una fonte ufficiale per la risoluzione – euristica da dominio/source
 * 3. Scadenza plausibile – euristica (titolo con date/“entro”, o default plausibile)
 */

import type { VerificationConfig, ResolvabilityCriteria } from "./types";

/** Default: parole che rendono il titolo vago o non verificabile. */
export const DEFAULT_VAGUE_KEYWORDS = [
  "potrebbe",
  "forse",
  "si dice",
  "sembra",
  "rumors",
  "rumour",
  "voci",
  "ipotesi",
  "forse",
  "chissà",
  "incerto",
  "mistero",
  "gossip",
  "ultim'ora",
  "breaking",
  "shock",
  "incredibile",
  "da non credere",
  "?",
];

/** Parole che suggeriscono domanda non binaria (es. "quanto", "chi"). */
export const DEFAULT_NON_BINARY_KEYWORDS = [
  "quanto",
  "quanti",
  "chi vincerà",
  "chi vince",
  "quale",
  "quali",
  "quando esattamente",
  "in che modo",
];

/**
 * Estrae l'hostname da un URL (lowercase). Restituisce "" se URL non valido.
 */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Verifica se il dominio è consentito (whitelist/blacklist).
 * Se whitelist non è vuota: solo domini in whitelist.
 * Blacklist: sempre esclusi.
 */
export function isDomainAllowed(
  url: string,
  config: Pick<VerificationConfig, "domainWhitelist" | "domainBlacklist">
): boolean {
  const host = getHostname(url);
  if (!host) return false;

  if (config.domainBlacklist.length > 0) {
    const blacklisted = config.domainBlacklist.some(
      (d) => host === d.toLowerCase() || host.endsWith("." + d.toLowerCase())
    );
    if (blacklisted) return false;
  }

  if (config.domainWhitelist.length > 0) {
    const whitelisted = config.domainWhitelist.some(
      (d) => host === d.toLowerCase() || host.endsWith("." + d.toLowerCase())
    );
    if (!whitelisted) return false;
  }

  return true;
}

/**
 * Controlla se il titolo è troppo vago (lunghezza o parole chiave).
 */
export function isTitleTooVague(title: string, config: VerificationConfig): boolean {
  const t = title.trim();
  if (t.length < config.minTitleLength) return true;
  if (config.maxTitleLength > 0 && t.length > config.maxTitleLength) return true;

  const lower = t.toLowerCase();
  const hasVague = config.vagueKeywords.some((kw) => lower.includes(kw.toLowerCase()));
  return hasVague;
}

/**
 * Controlla se il titolo suggerisce un esito non binario.
 */
export function suggestsNonBinary(title: string, config: VerificationConfig): boolean {
  const lower = title.trim().toLowerCase();
  return config.nonBinaryKeywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/** Domini spesso considerati fonti ufficiali/affidabili (euristica per "official source"). */
const OFFICIAL_LIKE_DOMAINS = new Set([
  "gov",
  "governo",
  "ministero",
  "corte",
  "tribunale",
  "istat",
  "europa.eu",
  "ec.europa.eu",
  "reuters.com",
  "apnews.com",
  "ansa.it",
  "repubblica.it",
  "corriere.it",
  "ilsole24ore.com",
  "agi.it",
]);

/**
 * Euristica: il dominio o source suggerisce una fonte ufficiale/affidabile?
 */
export function hasOfficialLikeSource(url: string, sourceName: string): boolean {
  const host = getHostname(url);
  const parts = host.split(".");
  const mainDomain = parts.length >= 2 ? parts.slice(-2).join(".") : host;
  if (OFFICIAL_LIKE_DOMAINS.has(mainDomain)) return true;
  if (OFFICIAL_LIKE_DOMAINS.has(host)) return true;
  const nameLower = sourceName.toLowerCase();
  if (["ansa", "reuters", "ap", "agi", "istat", "ministero", "governo"].some((s) => nameLower.includes(s)))
    return true;
  return false;
}

/**
 * Euristica: il titolo/snippet suggerisce una scadenza plausibile?
 * (es. "entro il 15 marzo", "alle 20", "domani", "nel 2025")
 */
export function suggestsPlausibleDeadline(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  const patterns = [
    /\b(entro|entro il|entro la|entro \d|entro marzo|entro aprile|…)\b/,
    /\b(il \d{1,2}\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre))\b/,
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
    /\b(domani|dopodomani|questa settimana|prossima settimana)\b/,
    /\b(alle \d{1,2}(:\d{2})?)\b/,
    /\b(nel 202\d)\b/,
  ];
  return patterns.some((p) => p.test(text));
}

/**
 * Valuta i criteri di risolvibilità per un candidato (senza applicare filtri).
 */
export function evaluateResolvabilityCriteria(
  title: string,
  snippet: string,
  url: string,
  sourceName: string,
  config: VerificationConfig
): ResolvabilityCriteria {
  const domainAllowed = isDomainAllowed(url, config);
  const notTooVague = !isTitleTooVague(title, config);
  const binaryOutcome = !suggestsNonBinary(title, config);
  const hasOfficialSource = hasOfficialLikeSource(url, sourceName);
  const plausibleDeadline = suggestsPlausibleDeadline(title, snippet);

  return {
    binaryOutcome,
    hasOfficialSource,
    plausibleDeadline,
    notTooVague,
    domainAllowed,
  };
}
