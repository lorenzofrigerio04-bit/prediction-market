import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { SourceObservationId } from "../../../observations/value-objects/source-observation-id.vo.js";
import type { ObservationInterpretationId } from "../../value-objects/event-intelligence-ids.vo.js";
import type {
  InterpretedClaim,
  InterpretedDate,
  InterpretedEntity,
  InterpretedNumber,
  InterpretationMetadata,
} from "../value-objects/interpreted-structures.vo.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";

export type ObservationInterpretation = Readonly<{
  id: ObservationInterpretationId;
  version: EntityVersion;
  source_observation_id: SourceObservationId;
  interpreted_entities: readonly InterpretedEntity[];
  interpreted_dates: readonly InterpretedDate[];
  interpreted_numbers: readonly InterpretedNumber[];
  interpreted_claims: readonly InterpretedClaim[];
  semantic_confidence: number;
  interpretation_metadata: InterpretationMetadata;
}>;

export const createObservationInterpretation = (
  input: ObservationInterpretation,
): ObservationInterpretation => {
  assertConfidence01(input.semantic_confidence, "semantic_confidence");
  if (
    input.interpreted_entities.length === 0 &&
    input.interpreted_dates.length === 0 &&
    input.interpreted_numbers.length === 0 &&
    input.interpreted_claims.length === 0
  ) {
    throw new ValidationError(
      "INVALID_OBSERVATION_INTERPRETATION",
      "at least one interpreted_* collection must contain data",
    );
  }
  return deepFreeze({
    ...input,
    interpreted_entities: [...input.interpreted_entities],
    interpreted_dates: [...input.interpreted_dates],
    interpreted_numbers: [...input.interpreted_numbers],
    interpreted_claims: [...input.interpreted_claims],
  });
};
