import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { ConsumptionStatus } from "../../enums/consumption-status.enum.js";
import { CREDIT_CONSUMPTION_EVENT_SCHEMA_ID } from "../../schemas/credit-consumption-event.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.consumption_status === ConsumptionStatus.COMPLETED && !(input.consumption_amount > 0)) {
        issues.push(errorIssue("CONSUMPTION_COMPLETED_AMOUNT_INVALID", "/consumption_amount", "completed consumption requires amount > 0"));
    }
    if (input.consumption_status === ConsumptionStatus.REJECTED && input.consumption_amount < 0) {
        issues.push(errorIssue("CONSUMPTION_REJECTED_AMOUNT_INVALID", "/consumption_amount", "rejected consumption cannot be negative"));
    }
    if (!Number.isFinite(input.consumption_amount)) {
        issues.push(errorIssue("CONSUMPTION_AMOUNT_INVALID", "/consumption_amount", "consumption_amount must be finite"));
    }
    return issues;
};
export const validateCreditConsumptionEvent = (input, options) => {
    const schemaValidator = requireSchemaValidator(CREDIT_CONSUMPTION_EVENT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("CreditConsumptionEvent", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-credit-consumption-event.js.map