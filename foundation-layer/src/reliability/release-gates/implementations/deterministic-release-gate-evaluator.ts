import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { FinalGateStatus } from "../../enums/final-gate-status.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import { createReleaseGateEvaluation, type ReleaseGateEvaluation } from "../entities/release-gate-evaluation.entity.js";
import type { ReleaseGateEvaluator, ReleaseGateInput } from "../interfaces/release-gate-evaluator.js";
import { createReleaseGateEvaluationId } from "../../value-objects/reliability-ids.vo.js";

const hasMandatoryFailure = (input: ReleaseGateInput): boolean =>
  !input.schema_gate_pass ||
  !input.validator_gate_pass ||
  !input.test_gate_pass ||
  !input.regression_gate_pass ||
  !input.compatibility_gate_pass ||
  !input.readiness_gate_pass;

const deriveFinalStatus = (input: ReleaseGateInput): FinalGateStatus => {
  if (hasMandatoryFailure(input)) {
    if (!input.compatibility_gate_pass || !input.readiness_gate_pass || !input.regression_gate_pass) {
      return FinalGateStatus.BLOCKED;
    }
    return FinalGateStatus.FAILED;
  }
  return FinalGateStatus.PASSED;
};

export class DeterministicReleaseGateEvaluator implements ReleaseGateEvaluator {
  evaluate(input: ReleaseGateInput): ReleaseGateEvaluation {
    const blockingReasons = [];
    if (!input.schema_gate_pass) {
      blockingReasons.push({
        code: "SCHEMA_GATE_FAILED",
        message: "Schema gate is false",
        module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
        path: "/schema_gate_pass",
      });
    }
    if (!input.validator_gate_pass) {
      blockingReasons.push({
        code: "VALIDATOR_GATE_FAILED",
        message: "Validator gate is false",
        module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
        path: "/validator_gate_pass",
      });
    }
    if (!input.test_gate_pass) {
      blockingReasons.push({
        code: "TEST_GATE_FAILED",
        message: "Test gate is false",
        module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
        path: "/test_gate_pass",
      });
    }
    if (!input.regression_gate_pass) {
      blockingReasons.push({
        code: "REGRESSION_GATE_FAILED",
        message: "Regression gate is false",
        module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
        path: "/regression_gate_pass",
      });
    }
    if (!input.compatibility_gate_pass) {
      blockingReasons.push({
        code: "COMPATIBILITY_GATE_FAILED",
        message: "Compatibility gate is false",
        module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
        path: "/compatibility_gate_pass",
      });
    }
    if (!input.readiness_gate_pass) {
      blockingReasons.push({
        code: "READINESS_GATE_FAILED",
        message: "Readiness gate is false",
        module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
        path: "/readiness_gate_pass",
      });
    }
    return createReleaseGateEvaluation({
      id: createReleaseGateEvaluationId("rge_evalgates01"),
      version: createEntityVersion(1),
      evaluated_at: createTimestamp("1970-01-01T00:00:00.000Z"),
      target_scope: input.target_scope,
      schema_gate_pass: input.schema_gate_pass,
      validator_gate_pass: input.validator_gate_pass,
      test_gate_pass: input.test_gate_pass,
      regression_gate_pass: input.regression_gate_pass,
      compatibility_gate_pass: input.compatibility_gate_pass,
      readiness_gate_pass: input.readiness_gate_pass,
      final_gate_status: deriveFinalStatus(input),
      blocking_reasons: blockingReasons,
    });
  }
}
