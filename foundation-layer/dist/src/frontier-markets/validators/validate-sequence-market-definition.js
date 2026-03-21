import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { CompletionPolicy } from "../enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../enums/sequence-validation-status.enum.js";
import { SEQUENCE_MARKET_DEFINITION_SCHEMA_ID } from "../schemas/sequence-market-definition.schema.js";
const validateSequenceInvariants = (input) => {
    const issues = [];
    if (input.sequence_targets.length < 2) {
        issues.push(errorIssue("SEQUENCE_TARGETS_INSUFFICIENT", "/sequence_targets", "sequence must have at least two targets"));
    }
    const requiredTargets = input.sequence_targets.filter((target) => target.required);
    if (requiredTargets.length === 0 && input.completion_policy === CompletionPolicy.ALL_REQUIRED) {
        issues.push(errorIssue("SEQUENCE_REQUIRED_TARGETS_MISSING", "/sequence_targets", "all_required completion policy requires at least one required target"));
    }
    if (input.required_order_policy === RequiredOrderPolicy.STRICT &&
        input.sequence_targets.some((target) => target.canonical_event_ref_or_predicate.kind === "deterministic_predicate")) {
        issues.push(errorIssue("SEQUENCE_STRICT_ORDER_WEAK_REFERENCE", "/required_order_policy", "strict required order with predicate-only targets should be reviewed"));
    }
    if (requiredTargets.length === 0 && input.sequence_validation_status === SequenceValidationStatus.VALID) {
        issues.push(errorIssue("SEQUENCE_STATUS_INCONSISTENT", "/sequence_validation_status", "sequence cannot be valid when required targets are missing"));
    }
    return issues;
};
export const validateSequenceMarketDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(SEQUENCE_MARKET_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateSequenceInvariants(input);
    return buildValidationReport("SequenceMarketDefinition", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-sequence-market-definition.js.map