export type DiscoveryRunMetrics = Readonly<{
    itemsFetched: number;
    itemsNormalized: number;
    signalsEmitted: number;
    duplicatesSkipped: number;
    errorsCount: number;
}>;
export declare const createDiscoveryRunMetrics: (input: DiscoveryRunMetrics) => DiscoveryRunMetrics;
//# sourceMappingURL=discovery-run-metrics.entity.d.ts.map