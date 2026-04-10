import type { SourceMarket, ReplicaOutcomeOption } from "@/lib/event-replica/types";
import type { ReplicaPipelineConfig } from "@/lib/event-replica/config";
import { fetchJsonWithRetry } from "@/lib/event-replica/fetch-json";
import { normalizeText } from "@/lib/event-replica/utils";
import {
  buildKalshiAuthHeaders,
  getKalshiAccessKeyId,
  hasKalshiRsaCredentials,
  loadKalshiPrivateKeyPem,
} from "@/lib/kalshi-auth";

interface KalshiMarketWire {
  ticker?: string;
  title?: string;
  subtitle?: string;
  event_title?: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  outcomes?: Array<{ key?: string; label?: string } | string>;
  rules_primary?: string;
  rules?: string;
  can_close_early?: boolean;
  settlement_source?: string;
  settlement_sources?: string[] | string;
  result_source?: string;
  source?: string;
  category?: string;
  series_ticker?: string;
  event_ticker?: string;
  volume?: number | string;
  volume_24h?: number | string;
  open_interest?: number | string;
  liquidity?: number | string;
  close_time?: string;
  expiration_time?: string;
  status?: string;
}

interface KalshiResponse {
  markets?: KalshiMarketWire[];
  data?: KalshiMarketWire[];
}

function parseKalshiOutcomes(raw: KalshiMarketWire): ReplicaOutcomeOption[] {
  if (Array.isArray(raw.outcomes) && raw.outcomes.length > 0) {
    const parsed = raw.outcomes
      .map((entry, idx) => {
        if (typeof entry === "string") {
          const label = entry.trim();
          if (!label) return null;
          return { key: `opt_${idx + 1}`, label };
        }
        const label = String(entry?.label ?? "").trim();
        const key = String(entry?.key ?? `opt_${idx + 1}`).trim();
        if (!label || !key) return null;
        return { key, label };
      })
      .filter((entry): entry is ReplicaOutcomeOption => Boolean(entry));
    if (parsed.length > 0) return parsed;
  }

  const yes = raw.yes_sub_title?.trim() || "Yes";
  const no = raw.no_sub_title?.trim() || "No";
  return [
    { key: "YES", label: yes },
    { key: "NO", label: no },
  ];
}

function normalizeKalshiSourceUrl(rawTicker: string): string {
  const ticker = rawTicker.trim().toLowerCase();
  if (!ticker) return "https://kalshi.com/";
  return `https://kalshi.com/markets/${encodeURIComponent(ticker)}`;
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeResolutionAuthority(raw: string): {
  sourceUrl: string;
  sourceLabel: string;
  sourceHost: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      sourceUrl: "https://trading-api.kalshi.com/trade-api/v2/markets",
      sourceLabel: "Regolamento ufficiale mercato Kalshi",
      sourceHost: "official_market_rulebook",
    };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.replace(/^www\./, "");
      return {
        sourceUrl: trimmed,
        sourceLabel: host,
        sourceHost: host,
      };
    } catch {
      // Fall back to text mode below
    }
  }

  return {
    sourceUrl: "https://trading-api.kalshi.com/trade-api/v2/markets",
    sourceLabel: trimmed,
    sourceHost: trimmed.toLowerCase().replace(/\s+/g, "_").slice(0, 64),
  };
}

function extractResolutionSource(raw: KalshiMarketWire): string {
  const sourceCandidates: unknown[] = [
    raw.settlement_source,
    raw.result_source,
    raw.source,
    raw.settlement_sources,
  ];
  for (const source of sourceCandidates) {
    if (Array.isArray(source)) {
      const first = source.find((entry) => typeof entry === "string" && entry.trim()) as
        | string
        | undefined;
      if (first) return first.trim();
      continue;
    }
    if (typeof source === "string" && source.trim()) return source.trim();
  }
  return "";
}

function extractEdgeCases(rulesRaw: string): string[] {
  if (!rulesRaw) return [];
  return rulesRaw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 20 &&
        /(if|unless|except|in case|edge case|dispute|void|annull|cancel)/i.test(line)
    )
    .slice(0, 6);
}

function mapKalshiMarket(raw: KalshiMarketWire): SourceMarket | null {
  const externalId = String(raw.ticker ?? raw.event_ticker ?? "").trim();
  const title = String(raw.title ?? raw.event_title ?? "").trim();
  if (!externalId || !title) return null;

  const closeRaw = raw.close_time ?? raw.expiration_time;
  const closeTime = closeRaw ? new Date(closeRaw) : null;
  if (!closeTime || Number.isNaN(closeTime.getTime())) return null;

  const rulesRaw = String(raw.rules_primary ?? raw.rules ?? "").trim();
  const description = String(raw.subtitle ?? "").trim();
  const category = String(raw.category ?? raw.series_ticker ?? "Altro").trim() || "Altro";
  const resolutionSourceRaw = extractResolutionSource(raw);
  const normalizedResolution = normalizeResolutionAuthority(resolutionSourceRaw);

  const riskFlags: string[] = [];
  if (!rulesRaw) riskFlags.push("missing_explicit_rules");
  if (normalizeText(title).length < 12) riskFlags.push("short_title");
  if (!resolutionSourceRaw) riskFlags.push("missing_explicit_resolution_source");

  const rankValue = Math.max(
    toNumber(raw.volume),
    toNumber(raw.volume_24h),
    toNumber(raw.open_interest),
    toNumber(raw.liquidity)
  );

  const marketUrl = normalizeKalshiSourceUrl(externalId);

  return {
    externalId,
    sourcePlatform: "kalshi",
    sourceUrl: marketUrl,
    title,
    description,
    category,
    closeTime,
    outcomes: parseKalshiOutcomes(raw),
    rulebook: {
      sourceRaw: rulesRaw || "Rules not explicitly provided by source payload.",
      resolutionSourceUrl: normalizedResolution.sourceUrl,
      resolutionAuthorityHost: normalizedResolution.sourceLabel,
      resolutionAuthorityType: "OFFICIAL",
      edgeCases: extractEdgeCases(rulesRaw),
      settlementNotes: "Market resolved according to Kalshi official market resolution.",
    },
    rawPayload: raw as Record<string, unknown>,
    provenance: {
      sourcePlatform: "kalshi",
      externalId,
      sourceUrl: marketUrl,
      fetchedAt: new Date().toISOString(),
      confidence: 0.62,
      riskFlags,
      rankMetric: "volume",
      rankValue,
    },
  };
}

export async function fetchKalshiMarkets(
  cfg: ReplicaPipelineConfig
): Promise<SourceMarket[]> {
  const explicitEnable = process.env.REPLICA_ENABLE_KALSHI === "true";
  const explicitDisable = process.env.REPLICA_ENABLE_KALSHI === "false";
  const hasCustomEndpoint = !!process.env.KALSHI_MARKETS_URL?.trim();
  const hasLegacyBearer = !!process.env.KALSHI_API_KEY?.trim();
  const hasRsa = hasKalshiRsaCredentials();

  // Kalshi is optional. If disabled (or not configured), skip quietly.
  if (
    explicitDisable ||
    (!explicitEnable && !hasLegacyBearer && !hasRsa && !hasCustomEndpoint)
  ) {
    return [];
  }

  const endpoint =
    process.env.KALSHI_MARKETS_URL?.trim() ??
    `https://trading-api.kalshi.com/trade-api/v2/markets?status=open&limit=${cfg.maxPerSource}`;

  const keyId = getKalshiAccessKeyId();
  const privatePem = loadKalshiPrivateKeyPem();
  const kalshiApiKey = process.env.KALSHI_API_KEY?.trim();

  const payload = await fetchJsonWithRetry<KalshiResponse>(endpoint, {
    timeoutMs: cfg.timeoutMs,
    retryCount: cfg.retryCount,
    ...(keyId && privatePem
      ? {
          getHeaders: () => buildKalshiAuthHeaders("GET", endpoint, privatePem, keyId),
        }
      : kalshiApiKey
        ? { headers: { Authorization: `Bearer ${kalshiApiKey}` } }
        : {}),
  });

  const rows = Array.isArray(payload.markets)
    ? payload.markets
    : Array.isArray(payload.data)
      ? payload.data
      : [];

  return rows
    .map(mapKalshiMarket)
    .filter((m): m is SourceMarket => Boolean(m))
    .slice(0, cfg.maxPerSource);
}
