import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { SeverityLevel } from "../../enums/severity-level.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import type { ArtifactReference } from "../../value-objects/artifact-reference.vo.js";
import { createArtifactReferenceCollection } from "../../value-objects/artifact-reference.vo.js";
import type {
  GoldenDatasetEntryId,
  RegressionCaseId,
} from "../../value-objects/reliability-ids.vo.js";

export type RegressionCase = Readonly<{
  id: RegressionCaseId;
  version: EntityVersion;
  case_name: string;
  target_module: TargetModule;
  input_refs: readonly ArtifactReference[];
  expected_behavior: string;
  failure_signature_nullable: string | null;
  severity: SeverityLevel;
  linked_dataset_entry_id_nullable: GoldenDatasetEntryId | null;
}>;

export const createRegressionCase = (input: RegressionCase): RegressionCase => {
  if (input.case_name.trim().length === 0) {
    throw new ValidationError("INVALID_REGRESSION_CASE", "case_name must not be empty");
  }
  if (!Object.values(TargetModule).includes(input.target_module)) {
    throw new ValidationError("INVALID_REGRESSION_CASE", "target_module is invalid");
  }
  if (!Object.values(SeverityLevel).includes(input.severity)) {
    throw new ValidationError("INVALID_REGRESSION_CASE", "severity is invalid");
  }
  if (input.severity === SeverityLevel.CRITICAL && input.expected_behavior.trim().length === 0) {
    throw new ValidationError(
      "INVALID_REGRESSION_CASE",
      "RegressionCase.expected_behavior is required for CRITICAL severity",
    );
  }
  return deepFreeze({
    ...input,
    input_refs: createArtifactReferenceCollection(input.input_refs, "RegressionCase.input_refs"),
    expected_behavior: input.expected_behavior.trim(),
    failure_signature_nullable:
      input.failure_signature_nullable === null ? null : input.failure_signature_nullable.trim(),
  });
};
