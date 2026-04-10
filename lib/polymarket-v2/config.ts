import type { PolymarketV2Config } from "./types";

function toNumber(v: string | undefined, fallback: number): number {
  if (!v) return fallback;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getPolymarketV2Config(): PolymarketV2Config {
  return {
    maxPerSource: Math.max(10, Math.floor(toNumber(process.env.POLYMARKET_V2_MAX_PER_SOURCE, 300))),
    timeoutMs: Math.max(5_000, Math.floor(toNumber(process.env.POLYMARKET_V2_FETCH_TIMEOUT_MS, 15_000))),
    retryCount: Math.max(0, Math.floor(toNumber(process.env.POLYMARKET_V2_FETCH_RETRY_COUNT, 2))),
    maxTotalDefault: Math.max(1, Math.floor(toNumber(process.env.POLYMARKET_V2_MAX_TOTAL_DEFAULT, 200))),
    processingHeadroomMultiplier: Math.max(
      1,
      Math.floor(toNumber(process.env.POLYMARKET_V2_PROCESSING_HEADROOM_MULTIPLIER, 3))
    ),
    localizationConcurrency: Math.max(
      1,
      Math.floor(toNumber(process.env.POLYMARKET_V2_LOCALIZATION_CONCURRENCY, 4))
    ),
    groupingMinSiblings: Math.max(
      2,
      Math.floor(toNumber(process.env.POLYMARKET_V2_GROUPING_MIN_SIBLINGS, 3))
    ),
    groupingMaxOutcomes: Math.max(
      3,
      Math.floor(toNumber(process.env.POLYMARKET_V2_GROUPING_MAX_OUTCOMES, 30))
    ),
    fidelityMinScore: Math.min(1, Math.max(0, toNumber(process.env.POLYMARKET_V2_FIDELITY_MIN_SCORE, 0.55))),
    qualityThreshold: Math.min(1, Math.max(0, toNumber(process.env.POLYMARKET_V2_QUALITY_THRESHOLD, 0.45))),
    requireAiTranslation:
      process.env.POLYMARKET_V2_REQUIRE_AI_TRANSLATION === "false" ? false : true,
  };
}
