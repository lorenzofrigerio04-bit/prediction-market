import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ImprovementArtifactType } from "../../enums/improvement-artifact-type.enum.js";
import type { CorrelationId } from "../../value-objects/correlation-id.vo.js";
import type { ImprovementArtifactId } from "../../value-objects/learning-feedback-ids.vo.js";
import {
  createLearningRefList,
  createLearningTextList,
  type LearningRef,
  type LearningText,
} from "../../value-objects/learning-feedback-shared.vo.js";

export type ImprovementArtifact = Readonly<{
  id: ImprovementArtifactId;
  version: EntityVersion;
  correlation_id: CorrelationId;
  artifact_type: ImprovementArtifactType;
  derived_from_refs: readonly LearningRef[];
  safety_constraints: readonly LearningText[];
  rollout_notes: readonly LearningText[];
  created_at: Timestamp;
}>;

export const createImprovementArtifact = (input: ImprovementArtifact): ImprovementArtifact => {
  if (!Object.values(ImprovementArtifactType).includes(input.artifact_type)) {
    throw new ValidationError("INVALID_IMPROVEMENT_ARTIFACT", "artifact_type is invalid");
  }
  if (input.correlation_id.trim().length === 0) {
    throw new ValidationError("INVALID_IMPROVEMENT_ARTIFACT", "correlation_id is required");
  }
  const derived_from_refs = createLearningRefList(input.derived_from_refs, "derived_from_refs", 1);
  const safety_constraints = createLearningTextList(input.safety_constraints, "safety_constraints", 1);

  return deepFreeze({
    ...input,
    derived_from_refs,
    safety_constraints,
    rollout_notes: createLearningTextList(input.rollout_notes, "rollout_notes"),
  });
};
