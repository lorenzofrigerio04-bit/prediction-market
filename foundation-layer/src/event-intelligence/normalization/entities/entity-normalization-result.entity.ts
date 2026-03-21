import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
import type { NormalizationMetadata } from "../../value-objects/shared-domain.vo.js";
import type { InterpretedEntity } from "../../interpretation/value-objects/interpreted-structures.vo.js";

export type EntityNormalizationResult = Readonly<{
  normalized_entities: readonly InterpretedEntity[];
  unresolved_entities: readonly InterpretedEntity[];
  normalization_confidence: number;
  normalization_metadata: NormalizationMetadata;
}>;

export const createEntityNormalizationResult = (
  input: EntityNormalizationResult,
): EntityNormalizationResult => {
  assertConfidence01(input.normalization_confidence, "normalization_confidence");
  if (input.normalized_entities.length === 0 && input.unresolved_entities.length === 0) {
    throw new ValidationError(
      "INVALID_ENTITY_NORMALIZATION_RESULT",
      "at least one of normalized_entities or unresolved_entities must be non-empty",
    );
  }
  return deepFreeze({
    ...input,
    normalized_entities: [...input.normalized_entities],
    unresolved_entities: [...input.unresolved_entities],
  });
};
