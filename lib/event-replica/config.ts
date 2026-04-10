export interface ReplicaPipelineConfig {
  maxPerSource: number;
  timeoutMs: number;
  retryCount: number;
  topPerCategory: number;
  italyMinScore: number;
  italyMinConfidence: number;
  italyMaxRiskFlags: number;
  maxTotalDefault: number;
  requireAiTranslation: boolean;
  qualityThreshold: number;
}

function toNumber(v: string | undefined, fallback: number): number {
  if (!v) return fallback;
  const parsed = Number(v);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

export function getReplicaPipelineConfig(): ReplicaPipelineConfig {
  return {
    maxPerSource: Math.max(5, Math.floor(toNumber(process.env.REPLICA_MAX_PER_SOURCE, 200))),
    timeoutMs: Math.max(5_000, Math.floor(toNumber(process.env.REPLICA_FETCH_TIMEOUT_MS, 15_000))),
    retryCount: Math.max(0, Math.floor(toNumber(process.env.REPLICA_FETCH_RETRY_COUNT, 2))),
    topPerCategory: Math.max(1, Math.floor(toNumber(process.env.REPLICA_TOP_PER_CATEGORY, 10))),
    italyMinScore: Math.min(1, Math.max(0, toNumber(process.env.REPLICA_ITALY_MIN_SCORE, 0.45))),
    italyMinConfidence: Math.min(
      1,
      Math.max(0, toNumber(process.env.REPLICA_ITALY_MIN_CONFIDENCE, 0.35))
    ),
    italyMaxRiskFlags: Math.max(0, Math.floor(toNumber(process.env.REPLICA_ITALY_MAX_RISK_FLAGS, 5))),
    maxTotalDefault: Math.max(1, Math.floor(toNumber(process.env.REPLICA_MAX_TOTAL_DEFAULT, 40))),
    requireAiTranslation:
      process.env.REPLICA_REQUIRE_AI_TRANSLATION === "false"
        ? false
        : true,
    qualityThreshold: Math.min(
      1,
      Math.max(0, toNumber(process.env.REPLICA_QUALITY_THRESHOLD, 0.52))
    ),
  };
}
