/**
 * Pure factor computation for discovery ranking.
 * Deterministic, no single opaque score; produces breakdown and reasons.
 */
import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type { DiscoveryStoryClusterSummary } from "../entities/discovery-story-cluster-summary.entity.js";
import type { DiscoveryTrendSnapshot } from "../entities/discovery-trend-snapshot.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { DiscoveryRankingScoreBreakdown } from "../entities/discovery-ranking-score-breakdown.entity.js";
import type { DiscoveryRankingReason } from "../entities/discovery-ranking-reason.entity.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
export type RankingFactorInput = Readonly<{
    cluster: DiscoveryStoryCluster;
    summary: DiscoveryStoryClusterSummary;
    snapshots: readonly DiscoveryTrendSnapshot[];
    now: Date;
    itemsById?: ReadonlyMap<string, NormalizedDiscoveryItem>;
    signalsById?: ReadonlyMap<string, DiscoverySignal>;
    isItalianSourceKey?: (sourceKey: string) => boolean;
    getSourceRoleNullable?: (sourceKey: string) => DiscoverySourceUsageRole | null;
}>;
export type RankingFactorOutput = Readonly<{
    breakdown: DiscoveryRankingScoreBreakdown;
    reasons: readonly DiscoveryRankingReason[];
    cautionFlags: readonly string[];
}>;
export declare function computeRankingFactors(input: RankingFactorInput): RankingFactorOutput;
//# sourceMappingURL=discovery-ranking-factors.d.ts.map