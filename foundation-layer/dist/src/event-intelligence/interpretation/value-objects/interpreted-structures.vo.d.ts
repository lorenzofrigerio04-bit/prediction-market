import type { EvidenceSpan } from "../../value-objects/shared-domain.vo.js";
export type InterpretedEntity = Readonly<{
    value: string;
    normalized_value: string;
    entity_type: string;
    confidence: number;
    evidence_spans: readonly EvidenceSpan[];
}>;
export type InterpretedDate = Readonly<{
    original_value: string;
    resolved_timestamp_nullable: string | null;
    confidence: number;
    evidence_spans: readonly EvidenceSpan[];
}>;
export type InterpretedNumber = Readonly<{
    original_value: number;
    unit_nullable: string | null;
    confidence: number;
    evidence_spans: readonly EvidenceSpan[];
}>;
export type InterpretedClaim = Readonly<{
    text: string;
    polarity: "AFFIRMATIVE" | "NEGATIVE" | "UNCERTAIN";
    confidence: number;
    evidence_spans: readonly EvidenceSpan[];
}>;
export type InterpretationMetadata = Readonly<{
    interpreter_version: string;
    strategy_ids: readonly string[];
    deterministic: boolean;
}>;
export declare const createInterpretedEntity: (input: InterpretedEntity) => InterpretedEntity;
export declare const createInterpretedDate: (input: InterpretedDate) => InterpretedDate;
export declare const createInterpretedNumber: (input: InterpretedNumber) => InterpretedNumber;
export declare const createInterpretedClaim: (input: InterpretedClaim) => InterpretedClaim;
export declare const createInterpretationMetadata: (input: InterpretationMetadata) => InterpretationMetadata;
//# sourceMappingURL=interpreted-structures.vo.d.ts.map