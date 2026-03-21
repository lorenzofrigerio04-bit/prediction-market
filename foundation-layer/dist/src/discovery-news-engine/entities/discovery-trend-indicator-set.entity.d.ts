/** Deterministic indicator values for trend evaluation (counts, booleans, time span). */
export type DiscoveryTrendIndicatorSet = Readonly<{
    signalCountInHorizon: number;
    sourceDiversityCount: number;
    hasAuthoritativeSource: boolean;
    hasEditorialSource: boolean;
    hasAttentionSource: boolean;
    recentActivityDensity: number;
    timeSpanHours: number;
    freshnessClassConsistency: "realtime" | "recent" | "archived" | "mixed";
    scheduledSourceRelevance: boolean;
}>;
export declare const createDiscoveryTrendIndicatorSet: (input: DiscoveryTrendIndicatorSet) => DiscoveryTrendIndicatorSet;
//# sourceMappingURL=discovery-trend-indicator-set.entity.d.ts.map