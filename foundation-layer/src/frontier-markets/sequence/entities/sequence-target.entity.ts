import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import {
  createDisplayLabel,
  createSemanticDefinition,
  type DisplayLabel,
  type SemanticDefinition,
} from "../../value-objects/frontier-text.vo.js";
import {
  createSequenceTargetKey,
  type SequenceTargetKey,
} from "../../value-objects/sequence-target-key.vo.js";

export type SequenceTargetRefOrPredicate =
  | Readonly<{
      kind: "canonical_event_ref";
      canonical_event_id: CanonicalEventIntelligenceId;
    }>
  | Readonly<{
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

export const createSequenceTarget = (input: SequenceTarget): SequenceTarget => {
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
    display_label: input.display_label.trim() as DisplayLabel,
    semantic_definition: input.semantic_definition.trim() as SemanticDefinition,
    canonical_event_ref_or_predicate:
      input.canonical_event_ref_or_predicate.kind === "deterministic_predicate"
        ? {
            ...input.canonical_event_ref_or_predicate,
            predicate_key: input.canonical_event_ref_or_predicate.predicate_key.trim(),
            predicate_params: { ...input.canonical_event_ref_or_predicate.predicate_params },
          }
        : input.canonical_event_ref_or_predicate,
  });
};
