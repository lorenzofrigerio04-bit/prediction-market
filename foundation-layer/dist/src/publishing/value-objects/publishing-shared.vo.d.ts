import { type ConfidenceScore } from "../../value-objects/confidence-score.vo.js";
export type DeterministicMetadata = Readonly<Record<string, unknown>>;
export type PublishingIssue = Readonly<{
    code: string;
    message: string;
    path: string;
}>;
export declare const createDeterministicMetadata: (value: Record<string, unknown>, field: string) => DeterministicMetadata;
export declare const createIssueCollection: (values: readonly PublishingIssue[], field: string) => readonly PublishingIssue[];
export declare const createSummaryConfidence: (value: number) => ConfidenceScore;
export declare const createStructuralReadinessScore: (value: number) => number;
export declare const createTextBlock: (value: string, field: string) => string;
export declare const createDeterministicToken: (seed: string) => string;
//# sourceMappingURL=publishing-shared.vo.d.ts.map