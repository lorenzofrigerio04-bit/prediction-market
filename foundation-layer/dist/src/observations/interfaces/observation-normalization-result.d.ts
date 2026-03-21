import type { SourceObservation } from "../entities/source-observation.entity.js";
import type { NormalizationIssue } from "./normalization-issue.js";
export type TraceabilityCompleteness = Readonly<{
    hasSourceReference: boolean;
    hasRawPayloadReference: boolean;
    hasEvidenceSpans: boolean;
    hasTraceabilityMetadata: boolean;
    isComplete: boolean;
}>;
export type ObservationNormalizationResult = Readonly<{
    observation: SourceObservation;
    validationIssues: readonly NormalizationIssue[];
    normalizationIssues: readonly NormalizationIssue[];
    deterministicWarnings: readonly string[];
    traceabilityCompleteness: TraceabilityCompleteness;
}>;
export declare const createObservationNormalizationResult: (input: ObservationNormalizationResult) => ObservationNormalizationResult;
//# sourceMappingURL=observation-normalization-result.d.ts.map