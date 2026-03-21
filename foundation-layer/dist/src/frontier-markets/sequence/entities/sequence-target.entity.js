import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createDisplayLabel, createSemanticDefinition, } from "../../value-objects/frontier-text.vo.js";
import { createSequenceTargetKey, } from "../../value-objects/sequence-target-key.vo.js";
export const createSequenceTarget = (input) => {
    createSequenceTargetKey(input.target_key);
    createDisplayLabel(input.display_label);
    createSemanticDefinition(input.semantic_definition);
    if (input.canonical_event_ref_or_predicate.kind === "deterministic_predicate") {
        if (input.canonical_event_ref_or_predicate.predicate_key.trim().length === 0) {
            throw new ValidationError("INVALID_SEQUENCE_TARGET", "predicate_key must be non-empty");
        }
    }
    return deepFreeze({
        ...input,
        display_label: input.display_label.trim(),
        semantic_definition: input.semantic_definition.trim(),
        canonical_event_ref_or_predicate: input.canonical_event_ref_or_predicate.kind === "deterministic_predicate"
            ? {
                ...input.canonical_event_ref_or_predicate,
                predicate_key: input.canonical_event_ref_or_predicate.predicate_key.trim(),
                predicate_params: { ...input.canonical_event_ref_or_predicate.predicate_params },
            }
            : input.canonical_event_ref_or_predicate,
    });
};
//# sourceMappingURL=sequence-target.entity.js.map