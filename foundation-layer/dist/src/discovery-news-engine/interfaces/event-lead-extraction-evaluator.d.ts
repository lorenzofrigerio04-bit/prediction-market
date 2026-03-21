import type { DiscoveryRankingEntry } from "../entities/discovery-ranking-entry.entity.js";
import type { DiscoveryStoryClusterSummary } from "../entities/discovery-story-cluster-summary.entity.js";
import type { DiscoveryTrendSnapshot } from "../entities/discovery-trend-snapshot.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { EventLeadExtractionDecision } from "../entities/event-lead-extraction-decision.entity.js";
/**
 * Input for event lead extraction: ranked entries plus optional context
 * to derive evidence and apply readiness rules.
 */
export type EventLeadExtractionContext = Readonly<{
    /** Ranked discovery entries (output of ranking engine). */
    rankedEntries: readonly DiscoveryRankingEntry[];
    /** Optional: summary per cluster (keyed by clusterId). */
    summariesByClusterId?: ReadonlyMap<string, DiscoveryStoryClusterSummary>;
    /** Optional: trend snapshots per cluster (keyed by clusterId). */
    snapshotsByClusterId?: ReadonlyMap<string, readonly DiscoveryTrendSnapshot[]>;
    /** Optional: resolve item by id for evidence set. */
    itemsById?: ReadonlyMap<string, NormalizedDiscoveryItem>;
    /** Optional: resolve signal by id for evidence set. */
    signalsById?: ReadonlyMap<string, DiscoverySignal>;
}>;
export type EventLeadExtractionResult = Readonly<{
    decisions: readonly EventLeadExtractionDecision[];
}>;
/**
 * Evaluates ranked discovery output and decides whether each cluster
 * becomes an EventLead or an explicit not_extracted outcome.
 * Conservative, deterministic, explainable; no ML/LLM.
 */
export interface EventLeadExtractionEvaluator {
    extract(context: EventLeadExtractionContext): EventLeadExtractionResult;
}
//# sourceMappingURL=event-lead-extraction-evaluator.d.ts.map