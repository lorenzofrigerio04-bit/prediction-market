/**
 * Etichette fonte “da lettore”: nomi di testate e agenzie riconoscibili,
 * mai nomi tecnici di API o aggregator.
 */

import type { RawNewsInput } from "./types";

/** Host → nome mostrato (hostname senza www, lowercase). */
const HOST_LABELS: Record<string, string> = {
  "gazzetta.it": "La Gazzetta dello Sport",
  "corrieredellosport.it": "Corriere dello Sport",
  "tuttosport.com": "Tuttosport",
  "bbc.co.uk": "BBC Sport",
  "bbc.com": "BBC Sport",
  "football365.com": "Football365",
  "skysport.it": "Sky Sport",
  "sport.sky.it": "Sky Sport",
  "repubblica.it": "la Repubblica",
  "ilpost.it": "Il Post",
  "ansa.it": "ANSA",
  "tuttomercatoweb.com": "Tuttomercatoweb",
  "goal.com": "Goal",
  "marca.com": "Marca",
  "as.com": "Diario AS",
  "corriere.it": "Corriere della Sera",
  "lastampa.it": "La Stampa",
  "ilsole24ore.com": "Il Sole 24 Ore",
  "eurosport.it": "Eurosport",
  "eurosport.com": "Eurosport",
  "calciomercato.com": "Calciomercato.com",
  "sportmediaset.mediaset.it": "SportMediaset",
  "espn.com": "ESPN",
  "theguardian.com": "The Guardian",
  "reuters.com": "Reuters",
  "api-football.com": "Lega Serie A · dati ufficiali",
  "v3.football.api-sports.io": "Lega Serie A · dati ufficiali",
  "predictionmaster.app": "PredictionMaster",
};

const SOURCE_ID_LABELS: Record<string, string> = {
  gazzetta: "La Gazzetta dello Sport",
  corrieredellosport: "Corriere dello Sport",
  tuttosport: "Tuttosport",
  "bbc-sport": "BBC Sport",
  football365: "Football365",
  "api-football": "Lega Serie A · dati ufficiali",
  platform: "PredictionMaster",
  newsapi: "Agenzie e testate sportive",
  rss: "Agenzie e testate sportive",
  rss_media: "Agenzie e testate sportive",
};

function hostSuffixLabel(host: string): string | undefined {
  const h = host.toLowerCase();
  if (HOST_LABELS[h]) return HOST_LABELS[h];
  const segments = h.split(".");
  for (let i = 0; i < segments.length; i++) {
    const suffix = segments.slice(i).join(".");
    if (HOST_LABELS[suffix]) return HOST_LABELS[suffix];
  }
  return undefined;
}

export function getPublicSourceLabelFromUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "localhost" || host.endsWith(".local")) return "PredictionMaster";
    return hostSuffixLabel(host);
  } catch {
    return undefined;
  }
}

/** Usa il primo URL canonico disponibile. */
export function getPublicSourceLabelFromUrls(sourceUrls: string[]): string {
  let hadValidUrl = false;
  for (const u of sourceUrls) {
    try {
      if (new URL(u).hostname) hadValidUrl = true;
    } catch {
      continue;
    }
    const label = getPublicSourceLabelFromUrl(u);
    if (label) return label;
  }
  if (hadValidUrl) return "Agenzie e testate sportive";
  return "Redazione PredictionMaster";
}

/** Risolve l’etichetta display al momento dell’ingest (URL + id sorgente dai fetcher). */
export function getPublicSourceLabelFromInput(input: Pick<RawNewsInput, "url" | "sourceId">): string {
  const fromUrl = getPublicSourceLabelFromUrl(input.url);
  if (fromUrl) return fromUrl;

  const sid = input.sourceId?.toLowerCase().trim();
  if (sid && SOURCE_ID_LABELS[sid]) return SOURCE_ID_LABELS[sid];

  return getPublicSourceLabelFromUrls([]);
}

/** In lettura: colonna opzionale o derivazione da URL già salvati. */
export function getNewsArticleDisplaySource(article: {
  sourceLabel?: string | null;
  sourceUrls: string[];
}): string {
  const stored = article.sourceLabel?.trim();
  if (stored) return stored;
  return getPublicSourceLabelFromUrls(article.sourceUrls);
}
