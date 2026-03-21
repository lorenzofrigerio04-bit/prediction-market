import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { SourceObservationId } from "../../observations/value-objects/source-observation-id.vo.js";
import type { EventCandidateId, CanonicalEventIntelligenceId } from "./event-intelligence-ids.vo.js";
export type TemporalWindow = Readonly<{
    start_at: Timestamp;
    end_at: Timestamp;
}>;
export type EvidenceSpan = Readonly<{
    span_id: string;
    source_observation_id: SourceObservationId;
    locator: string;
    start_offset: number | null;
    end_offset: number | null;
    extracted_text_nullable: string | null;
    mapped_field_nullable: string | null;
}>;
export type SubjectReference = Readonly<{
    value: string;
    normalized_value: string;
    entity_type: string;
}>;
export type ActionReference = Readonly<{
    value: string;
    normalized_value: string;
}>;
export type ObjectReference = Readonly<{
    value: string;
    normalized_value: string;
    entity_type_nullable: string | null;
}>;
export type JurisdictionReference = Readonly<{
    code: string;
    label_nullable: string | null;
}>;
export type GraphMetadata = Readonly<{
    created_from_candidate_ids: readonly EventCandidateId[];
    relation_count: number;
}>;
export type SimilarityScore = Readonly<{
    left_candidate_id: EventCandidateId;
    right_candidate_id: EventCandidateId;
    score: number;
}>;
export type ConflictDescriptor = Readonly<{
    field: string;
    left_value_nullable: string | null;
    right_value_nullable: string | null;
}>;
export type NormalizationMetadata = Readonly<{
    strategy_id: string;
    resolver_version: string;
}>;
export declare const createTemporalWindow: (input: TemporalWindow) => TemporalWindow;
export declare const createEvidenceSpan: (input: EvidenceSpan) => EvidenceSpan;
export declare const createSubjectReference: (input: SubjectReference) => SubjectReference;
export declare const createActionReference: (input: ActionReference) => ActionReference;
export declare const createObjectReference: (input: ObjectReference) => ObjectReference;
export declare const createJurisdictionReference: (input: JurisdictionReference) => JurisdictionReference;
export declare const createSimilarityScore: (input: SimilarityScore) => SimilarityScore;
export declare const createGraphMetadata: (input: GraphMetadata) => GraphMetadata;
export declare const createConflictDescriptor: (input: ConflictDescriptor) => ConflictDescriptor;
export declare const createNormalizationMetadata: (input: NormalizationMetadata) => NormalizationMetadata;
export declare const assertConfidence01: (value: number, field: string) => void;
export type EventReferencePair = Readonly<{
    candidate_id: EventCandidateId;
    canonical_event_id: CanonicalEventIntelligenceId;
}>;
//# sourceMappingURL=shared-domain.vo.d.ts.map