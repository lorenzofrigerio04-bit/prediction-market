import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { type DisplayLabel, type SemanticDefinition } from "../../value-objects/frontier-text.vo.js";
import { type SequenceTargetKey } from "../../value-objects/sequence-target-key.vo.js";
export type SequenceTargetRefOrPredicate = Readonly<{
    kind: "canonical_event_ref";
    canonical_event_id: CanonicalEventIntelligenceId;
}> | Readonly<{
    kind: "deterministic_predicate";
    predicate_key: string;
    predicate_params: Readonly<Record<string, string | number | boolean>>;
}>;
export type SequenceTarget = Readonly<{
    target_key: SequenceTargetKey;
    canonical_event_ref_or_predicate: SequenceTargetRefOrPredicate;
    display_label: DisplayLabel;
    semantic_definition: SemanticDefinition;
    required: boolean;
}>;
export declare const createSequenceTarget: (input: SequenceTarget) => SequenceTarget;
//# sourceMappingURL=sequence-target.entity.d.ts.map