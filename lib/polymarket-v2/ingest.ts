import { fetchPolymarketMarkets } from "@/lib/event-sources/polymarket";
import type { SourceMarket } from "@/lib/event-replica/types";
import { getPolymarketV2Config } from "./config";

export async function ingestPolymarketMarkets(): Promise<SourceMarket[]> {
  const cfg = getPolymarketV2Config();
  const rows = await fetchPolymarketMarkets({
    maxPerSource: cfg.maxPerSource,
    timeoutMs: cfg.timeoutMs,
    retryCount: cfg.retryCount,
    topPerCategory: cfg.maxPerSource,
    italyMinScore: 0,
    italyMinConfidence: 0,
    italyMaxRiskFlags: 999,
    maxTotalDefault: cfg.maxTotalDefault,
    requireAiTranslation: cfg.requireAiTranslation,
    qualityThreshold: cfg.qualityThreshold,
  });
  return rows.slice(0, cfg.maxPerSource);
}
