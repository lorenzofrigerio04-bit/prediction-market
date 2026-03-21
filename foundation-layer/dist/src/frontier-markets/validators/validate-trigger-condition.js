import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { TriggerType } from "../enums/trigger-type.enum.js";
import { TRIGGER_CONDITION_SCHEMA_ID } from "../schemas/trigger-condition.schema.js";
const validateTriggerInvariants = (input) => {
    const issues = [];
    if (input.trigger_type === TriggerType.UPSTREAM_EVENT && input.upstream_event_ref_or_market_ref.kind !== "upstream_event") {
        issues.push(errorIssue("TRIGGER_TYPE_REFERENCE_MISMATCH", "/upstream_event_ref_or_market_ref", "trigger_type upstream_event requires upstream_event reference"));
    }
    if (input.trigger_type === TriggerType.UPSTREAM_MARKET &&
        input.upstream_event_ref_or_market_ref.kind !== "upstream_market") {
        issues.push(errorIssue("TRIGGER_TYPE_REFERENCE_MISMATCH", "/upstream_event_ref_or_market_ref", "trigger_type upstream_market requires upstream_market reference"));
    }
    return issues;
};
export const validateTriggerCondition = (input, options) => {
    const schemaValidator = requireSchemaValidator(TRIGGER_CONDITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateTriggerInvariants(input);
    return buildValidationReport("TriggerCondition", input.triggering_outcome, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-trigger-condition.js.map