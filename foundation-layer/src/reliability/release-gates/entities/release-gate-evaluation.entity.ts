import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { FinalGateStatus } from "../../enums/final-gate-status.enum.js";
import { DatasetScope } from "../../enums/dataset-scope.enum.js";
import type { ReleaseGateEvaluationId } from "../../value-objects/reliability-ids.vo.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
import { createBlockingReasonCollection } from "../../value-objects/blocking-reason.vo.js";

export type ReleaseGateEvaluation = Readonly<{
  id: ReleaseGateEvaluationId;
  version: EntityVersion;
  evaluated_at: Timestamp;
  target_scope: DatasetScope;
  schema_gate_pass: boolean;
  validator_gate_pass: boolean;
  test_gate_pass: boolean;
  regression_gate_pass: boolean;
  compatibility_gate_pass: boolean;
  readiness_gate_pass: boolean;
  final_gate_status: FinalGateStatus;
  blocking_reasons: readonly BlockingReason[];
}>;

const hasMandatoryGateFailure = (input: ReleaseGateEvaluation): boolean =>
  !input.schema_gate_pass ||
  !input.validator_gate_pass ||
  !input.test_gate_pass ||
  !input.regression_gate_pass ||
  !input.compatibility_gate_pass ||
  !input.readiness_gate_pass;

export const createReleaseGateEvaluation = (input: ReleaseGateEvaluation): ReleaseGateEvaluation => {
  if (!Object.values(DatasetScope).includes(input.target_scope)) {
    throw new ValidationError("INVALID_RELEASE_GATE_EVALUATION", "target_scope is invalid");
  }
  if (!Object.values(FinalGateStatus).includes(input.final_gate_status)) {
    throw new ValidationError("INVALID_RELEASE_GATE_EVALUATION", "final_gate_status is invalid");
  }
  if (input.final_gate_status === FinalGateStatus.PASSED && hasMandatoryGateFailure(input)) {
    throw new ValidationError(
      "INVALID_RELEASE_GATE_EVALUATION",
      "ReleaseGateEvaluation.final_gate_status cannot be PASSED when mandatory gates contain false",
    );
  }
  return deepFreeze({
    ...input,
    blocking_reasons: createBlockingReasonCollection(input.blocking_reasons),
  });
};
