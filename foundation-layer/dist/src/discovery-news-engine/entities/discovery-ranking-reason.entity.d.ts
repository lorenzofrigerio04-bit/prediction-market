export type DiscoveryRankingReasonImpact = "positive" | "negative" | "neutral";
export type DiscoveryRankingReason = Readonly<{
    code: string;
    label: string;
    impact: DiscoveryRankingReasonImpact;
}>;
export declare const createDiscoveryRankingReason: (input: DiscoveryRankingReason) => DiscoveryRankingReason;
//# sourceMappingURL=discovery-ranking-reason.entity.d.ts.map