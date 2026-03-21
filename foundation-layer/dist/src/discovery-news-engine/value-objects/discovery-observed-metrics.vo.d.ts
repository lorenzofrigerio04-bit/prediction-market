/**
 * Minimal structured observed metrics for discovery items.
 * Adapters set only the fields they have; no overbuilt analytics model.
 */
export type DiscoveryObservedMetrics = Readonly<{
    pageviewsNullable?: number;
    timeframeNullable?: string;
    regionNullable?: string;
    channelIdNullable?: string;
}>;
export declare const createDiscoveryObservedMetrics: (input: DiscoveryObservedMetrics) => DiscoveryObservedMetrics;
//# sourceMappingURL=discovery-observed-metrics.vo.d.ts.map