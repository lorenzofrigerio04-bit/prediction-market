export type DiscoveryFetchFailure = Readonly<{
    code: string;
    message: string;
    retryable: boolean;
    detailsNullable: Record<string, unknown> | null;
}>;
export declare const createDiscoveryFetchFailure: (input: DiscoveryFetchFailure) => DiscoveryFetchFailure;
//# sourceMappingURL=discovery-fetch-failure.entity.d.ts.map