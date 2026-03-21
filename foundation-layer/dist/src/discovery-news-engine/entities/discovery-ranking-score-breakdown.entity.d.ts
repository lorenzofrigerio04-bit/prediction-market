/** Ordinal level for factors that have strength (e.g. italian relevance, atomicity). */
export type DiscoveryRankingFactorLevel = "high" | "medium" | "low" | "none";
export type DiscoveryRankingScoreBreakdown = Readonly<{
    /** Novelty: first-seen vs recurring; or age bucket. */
    novelty: "new" | "recurring" | "unknown";
    /** Signal count / density from trend indicators. */
    signalDensity: "high" | "medium" | "low";
    /** Source diversity (e.g. ≥2 sources = positive). */
    sourceDiversity: "high" | "medium" | "low";
    authoritativeRelevance: boolean;
    editorialRelevance: boolean;
    attentionRelevance: boolean;
    /** Italian-first: geo IT, share of IT sources. */
    italianRelevance: DiscoveryRankingFactorLevel;
    /** Freshness / recency band. */
    freshness: "realtime" | "recent" | "archived" | "mixed";
    scheduledRelevance: boolean;
    /** Event-readiness hint; no EventLead. */
    atomicityPotential: DiscoveryRankingFactorLevel;
    /** Resolvability hint; no EventLead. */
    resolvabilityPotential: DiscoveryRankingFactorLevel;
}>;
export declare const createDiscoveryRankingScoreBreakdown: (input: DiscoveryRankingScoreBreakdown) => DiscoveryRankingScoreBreakdown;
//# sourceMappingURL=discovery-ranking-score-breakdown.entity.d.ts.map