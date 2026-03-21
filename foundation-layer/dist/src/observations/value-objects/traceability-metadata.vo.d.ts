export type TraceabilityMetadata = Readonly<{
    normalizerVersion: string;
    mappingStrategyIds: readonly string[];
    isTraceabilityComplete: boolean;
    provenanceChain: readonly string[];
}>;
export declare const createTraceabilityMetadata: (input: TraceabilityMetadata) => TraceabilityMetadata;
//# sourceMappingURL=traceability-metadata.vo.d.ts.map