import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EvidenceSpan } from "../../value-objects/shared-domain.vo.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";

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

const assertNonEmpty = (value: string, field: string): string => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_INTERPRETATION_VALUE", `${field} must be non-empty`, {
      field,
    });
  }
  return normalized;
};

export const createInterpretedEntity = (input: InterpretedEntity): InterpretedEntity => {
  assertConfidence01(input.confidence, "interpreted entity confidence");
  return deepFreeze({
    ...input,
    value: assertNonEmpty(input.value, "value"),
    normalized_value: assertNonEmpty(input.normalized_value, "normalized_value"),
    entity_type: assertNonEmpty(input.entity_type, "entity_type"),
    evidence_spans: [...input.evidence_spans],
  });
};

export const createInterpretedDate = (input: InterpretedDate): InterpretedDate => {
  assertConfidence01(input.confidence, "interpreted date confidence");
  if (
    input.resolved_timestamp_nullable !== null &&
    Number.isNaN(Date.parse(input.resolved_timestamp_nullable))
  ) {
    throw new ValidationError(
      "INVALID_INTERPRETED_DATE",
      "resolved_timestamp_nullable must be a valid ISO timestamp when provided",
    );
  }
  return deepFreeze({
    ...input,
    original_value: assertNonEmpty(input.original_value, "original_value"),
    evidence_spans: [...input.evidence_spans],
  });
};

export const createInterpretedNumber = (input: InterpretedNumber): InterpretedNumber => {
  assertConfidence01(input.confidence, "interpreted number confidence");
  if (!Number.isFinite(input.original_value)) {
    throw new ValidationError("INVALID_INTERPRETED_NUMBER", "original_value must be finite");
  }
  return deepFreeze({
    ...input,
    evidence_spans: [...input.evidence_spans],
  });
};

export const createInterpretedClaim = (input: InterpretedClaim): InterpretedClaim => {
  assertConfidence01(input.confidence, "interpreted claim confidence");
  return deepFreeze({
    ...input,
    text: assertNonEmpty(input.text, "text"),
    evidence_spans: [...input.evidence_spans],
  });
};

export const createInterpretationMetadata = (
  input: InterpretationMetadata,
): InterpretationMetadata => {
  if (input.strategy_ids.length === 0) {
    throw new ValidationError(
      "INVALID_INTERPRETATION_METADATA",
      "strategy_ids must contain at least one strategy",
    );
  }
  return deepFreeze({
    ...input,
    interpreter_version: assertNonEmpty(input.interpreter_version, "interpreter_version"),
    strategy_ids: [...input.strategy_ids].map((strategyId) =>
      assertNonEmpty(strategyId, "strategy_ids[]"),
    ),
  });
};
