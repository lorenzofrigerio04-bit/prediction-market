import { errorIssue } from "../../entities/validation-report.entity.js";
import { FinalGateStatus } from "../enums/final-gate-status.enum.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { RELEASE_GATE_EVALUATION_SCHEMA_ID } from "../schemas/release-gate-evaluation.schema.js";
const validateReleaseGateEvaluationInvariants = (input) => {
    const issues = [];
    const hasMandatoryGateFailure = !input.schema_gate_pass ||
        !input.validator_gate_pass ||
        !input.test_gate_pass ||
        !input.regression_gate_pass ||
        !input.compatibility_gate_pass ||
        !input.readiness_gate_pass;
    if (input.final_gate_status === FinalGateStatus.PASSED && hasMandatoryGateFailure) {
        issues.push(errorIssue("INVALID_FINAL_GATE_STATUS", "/final_gate_status", "ReleaseGateEvaluation.finalGateStatus cannot be PASSED when mandatory gates contain false"));
    }
    return issues;
};
export const validateReleaseGateEvaluation = (input, options) => {
    const schemaValidator = requireSchemaValidator(RELEASE_GATE_EVALUATION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateReleaseGateEvaluationInvariants(input);
    return buildValidationReport("ReleaseGateEvaluation", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-release-gate-evaluation.js.map