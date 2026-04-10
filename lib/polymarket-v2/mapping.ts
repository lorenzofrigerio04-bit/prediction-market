import { buildReplicaCandidate } from "@/lib/event-replica/candidate-adapter";
import type { ReplicaCandidate, SemanticTranslationResult, SourceMarket } from "@/lib/event-replica/types";
import type { SoftScoreResult } from "./types";

export function mapToPolymarketV2Candidate(params: {
  market: SourceMarket;
  translated: SemanticTranslationResult;
  softScore: SoftScoreResult;
}): ReplicaCandidate {
  const { market, translated, softScore } = params;
  const base = buildReplicaCandidate({
    market,
    translated,
    rank: {
      metric: "volume",
      value: Math.round(softScore.score * 100_000),
    },
  });

  return {
    ...base,
    creationMetadata: {
      ...(base.creationMetadata ?? {}),
      created_by_pipeline: "polymarket-v2",
      pipeline_version: "2.0",
      replica_source_platform: "polymarket",
      replica_external_id: market.externalId,
      replica_source_url: market.sourceUrl,
      polymarket_v2_external_id: market.externalId,
      polymarket_v2_source_url: market.sourceUrl,
      polymarket_v2_original_title: market.title,
      polymarket_v2_original_description: market.description,
      polymarket_v2_outcomes_original: market.outcomes,
      polymarket_v2_close_time_source: market.closeTime.toISOString(),
      polymarket_v2_resolution_source: market.rulebook.resolutionSourceUrl,
      polymarket_v2_raw_payload: market.rawPayload,
      ...(Array.isArray((market.rawPayload as Record<string, unknown>)?.polymarket_v2_group_children)
        ? {
            polymarket_v2_group_children: (market.rawPayload as Record<string, unknown>)
              .polymarket_v2_group_children,
          }
        : {}),
      polymarket_v2_ingested_at: market.provenance.fetchedAt,
      polymarket_v2_last_sync_at: new Date().toISOString(),
      polymarket_v2_sync_status: "INGESTED",
      polymarket_v2_soft_score: softScore.score,
      polymarket_v2_soft_score_reasons: softScore.reasons,
    },
  };
}
