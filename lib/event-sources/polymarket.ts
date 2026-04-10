import type { SourceMarket, ReplicaOutcomeOption } from "@/lib/event-replica/types";
import type { ReplicaPipelineConfig } from "@/lib/event-replica/config";
import { fetchJsonWithRetry } from "@/lib/event-replica/fetch-json";
import { normalizeText } from "@/lib/event-replica/utils";

interface PolymarketMarketWire {
  id?: string | number;
  slug?: string;
  question?: string;
  description?: string;
  endDate?: string;
  end_date_iso?: string;
  closeTime?: string;
  category?: string;
  active?: boolean;
  closed?: boolean;
  outcomes?: unknown;
  options?: unknown;
  rules?: string;
  resolutionSource?: string;
  resolution_source?: string;
  volume?: number;
  liquidity?: number;
  tags?: Array<{ slug?: string; name?: string }>;
}

interface PolymarketListResponseMaybeArray extends Array<PolymarketMarketWire> {}

function parseOutcomes(raw: unknown): ReplicaOutcomeOption[] {
  if (Array.isArray(raw)) {
    if (raw.every((v) => typeof v === "string")) {
      return raw.map((label, idx) => ({ key: `opt_${idx}`, label }));
    }
    if (
      raw.every(
        (v) =>
          v &&
          typeof v === "object" &&
          typeof (v as { label?: unknown }).label === "string"
      )
    ) {
      return raw.map((v, idx) => {
        const entry = v as { label: string; id?: string; key?: string };
        return { key: entry.key ?? entry.id ?? `opt_${idx}`, label: entry.label };
      });
    }
  }

  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return [];
    try {
      const parsed = JSON.parse(value) as unknown;
      return parseOutcomes(parsed);
    } catch {
      const parts = value
        .split(/[|,]/)
        .map((item) => item.trim())
        .filter(Boolean);
      return parts.map((label, idx) => ({ key: `opt_${idx}`, label }));
    }
  }

  return [];
}

function normalizeResolutionUrl(raw: unknown): string {
  const asString = typeof raw === "string" ? raw.trim() : "";
  if (!asString) return "https://polymarket.com/";
  try {
    const parsed = new URL(asString);
    return parsed.toString();
  } catch {
    return "https://polymarket.com/";
  }
}

function mapCategoryToItalian(rawCategory: string | undefined, title: string, description: string): string {
  const normalized = (rawCategory ?? "").trim().toLowerCase();
  const text = `${title} ${description}`.toLowerCase();

  const direct: Record<string, string> = {
    politics: "Politica",
    political: "Politica",
    sport: "Sport",
    sports: "Sport",
    crypto: "Criptovalute",
    cryptocurrency: "Criptovalute",
    finance: "Finanza",
    fintech: "Finanza",
    geopolitics: "Geopolitica",
    world: "Geopolitica",
    technology: "Tecnologia",
    tech: "Tecnologia",
    culture: "Cultura",
    entertainment: "Cultura",
    economy: "Economia",
    economics: "Economia",
    weather: "Tempo atmosferico",
    elections: "Elezioni",
    election: "Elezioni",
  };
  if (direct[normalized]) return direct[normalized];

  if (/\b(election|elections|voto|president|parliament)\b/i.test(text)) return "Elezioni";
  if (/\b(weather|storm|rain|snow|temperature|meteo)\b/i.test(text)) return "Tempo atmosferico";
  if (/\b(bitcoin|ethereum|crypto|solana|token|btc|eth)\b/i.test(text)) return "Criptovalute";
  if (/\b(inflation|gdp|ecb|economy|recession|pil|inflazione)\b/i.test(text)) return "Economia";
  if (/\b(stock|nasdaq|s&p|earnings|bond|tesla|apple|microsoft)\b/i.test(text)) return "Finanza";
  if (/\b(war|ukraine|russia|china|taiwan|middle east|nato|ue|eu)\b/i.test(text)) return "Geopolitica";
  if (/\b(ai|artificial intelligence|openai|gpu|chip|software|tech)\b/i.test(text)) return "Tecnologia";
  if (/\b(football|soccer|f1|tennis|olympics|champions)\b/i.test(text)) return "Sport";
  if (/\b(movie|music|album|festival|oscar|grammy)\b/i.test(text)) return "Cultura";
  return "Politica";
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  if (!match) return null;
  try {
    return new URL(match[0]).toString();
  } catch {
    return null;
  }
}

function detectResolutionSourceFromDescription(description: string): {
  url: string;
  host: string;
  label: string;
} {
  const firstUrl = extractFirstUrl(description);
  if (firstUrl) {
    const host = new URL(firstUrl).host;
    return { url: firstUrl, host, label: host };
  }

  const lower = description.toLowerCase();
  const mappings: Array<{ labelPattern: RegExp; host: string; url: string; label: string }> = [
    { labelPattern: /\bnhl\b/i, host: "nhl.com", url: "https://www.nhl.com/", label: "NHL" },
    { labelPattern: /\buefa\b/i, host: "uefa.com", url: "https://www.uefa.com/", label: "UEFA" },
    { labelPattern: /\bfifa\b/i, host: "fifa.com", url: "https://www.fifa.com/", label: "FIFA" },
    { labelPattern: /\bsec\b/i, host: "sec.gov", url: "https://www.sec.gov/", label: "SEC" },
    { labelPattern: /\bcoingecko\b/i, host: "coingecko.com", url: "https://www.coingecko.com/", label: "CoinGecko" },
    { labelPattern: /\bcme\b/i, host: "cmegroup.com", url: "https://www.cmegroup.com/", label: "CME Group" },
    { labelPattern: /\breuters\b/i, host: "reuters.com", url: "https://www.reuters.com/", label: "Reuters" },
  ];
  for (const map of mappings) {
    if (map.labelPattern.test(lower)) return { url: map.url, host: map.host, label: map.label };
  }

  const sourcePhrase =
    description.match(/primary resolution source[^.:\n]*[:]?([^.\n]+)/i)?.[1]?.trim() ??
    description.match(/resolution source[^.:\n]*[:]?([^.\n]+)/i)?.[1]?.trim();
  if (sourcePhrase) {
    const label = sourcePhrase.slice(0, 80);
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return {
      url: `https://www.polymarket.com/`,
      host: slug || "official-source",
      label,
    };
  }

  return { url: "https://www.polymarket.com/", host: "polymarket.com", label: "Polymarket" };
}

function extractEdgeCasesFromText(description: string): string[] {
  const lines = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const edge = lines.filter((line) =>
    /(if|unless|invalid|appeal|dismissal|dropped|canceled|annull|rinvio|cancell)/i.test(line)
  );
  return edge.slice(0, 6);
}

function buildRulebookContext(raw: PolymarketMarketWire, description: string, closeTime: Date): string {
  const rulesRaw = String(raw.rules ?? "").trim();
  const context = rulesRaw || description || "Rulebook context unavailable from source payload.";
  const deadline = `Scadenza ufficiale mercato (UTC): ${closeTime.toISOString()}`;
  return `${context}\n\n${deadline}`;
}

function mapPolymarketMarket(raw: PolymarketMarketWire): SourceMarket | null {
  const externalId = String(raw.id ?? raw.slug ?? "").trim();
  const title = String(raw.question ?? "").trim();
  if (!externalId || !title) return null;

  const closeTimeRaw = raw.endDate ?? raw.end_date_iso ?? raw.closeTime;
  const closeTime = closeTimeRaw ? new Date(closeTimeRaw) : null;
  if (!closeTime || Number.isNaN(closeTime.getTime())) return null;

  const outcomes = parseOutcomes(raw.outcomes ?? raw.options);
  if (outcomes.length < 2) return null;

  const sourceUrl = raw.slug
    ? `https://polymarket.com/event/${raw.slug}`
    : `https://polymarket.com/market/${externalId}`;

  const category = mapCategoryToItalian(raw.category, title, String(raw.description ?? ""));
  const description = String(raw.description ?? "").trim();
  const rulesRaw = buildRulebookContext(raw, description, closeTime);
  const detectedSource = detectResolutionSourceFromDescription(description);
  const resolutionSourceUrl = normalizeResolutionUrl(
    raw.resolutionSource ?? raw.resolution_source ?? detectedSource.url
  );
  const edgeCases = extractEdgeCasesFromText(description);

  const confidence = 0.65 + (raw.volume && raw.volume > 50_000 ? 0.1 : 0);
  const riskFlags: string[] = [];
  if (!String(raw.rules ?? "").trim() && !description) riskFlags.push("missing_explicit_rules");
  if (!description) riskFlags.push("missing_description");
  if (normalizeText(title).length < 12) riskFlags.push("short_title");
  if (detectedSource.host === "polymarket.com") riskFlags.push("generic_resolution_source");

  return {
    externalId,
    sourcePlatform: "polymarket",
    sourceUrl,
    title,
    description,
    category,
    closeTime,
    outcomes,
    rulebook: {
      sourceRaw: rulesRaw,
      resolutionSourceUrl,
      resolutionAuthorityHost: detectedSource.host,
      resolutionAuthorityType: "OFFICIAL",
      edgeCases,
      settlementNotes: `Fonte primaria dichiarata: ${detectedSource.label}.`,
    },
    rawPayload: raw as Record<string, unknown>,
    provenance: {
      sourcePlatform: "polymarket",
      externalId,
      sourceUrl,
      fetchedAt: new Date().toISOString(),
      confidence: Math.min(1, confidence),
      riskFlags,
    },
  };
}

export async function fetchPolymarketMarkets(
  cfg: ReplicaPipelineConfig
): Promise<SourceMarket[]> {
  const endpoint =
    process.env.POLYMARKET_MARKETS_URL?.trim() ??
    `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=${cfg.maxPerSource}`;

  const rows = await fetchJsonWithRetry<PolymarketListResponseMaybeArray>(endpoint, {
    timeoutMs: cfg.timeoutMs,
    retryCount: cfg.retryCount,
  });

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map(mapPolymarketMarket)
    .filter((m): m is SourceMarket => Boolean(m))
    .slice(0, cfg.maxPerSource);
}
