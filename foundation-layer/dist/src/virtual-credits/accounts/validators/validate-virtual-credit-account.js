import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID } from "../../schemas/virtual-credit-account.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.owner_ref.length === 0) {
        issues.push(errorIssue("OWNER_REF_REQUIRED", "/owner_ref", "owner_ref is required"));
    }
    if (input.currency_key.length === 0) {
        issues.push(errorIssue("CURRENCY_KEY_REQUIRED", "/currency_key", "currency_key is required"));
    }
    if (input.current_balance_nullable !== null && !Number.isFinite(input.current_balance_nullable)) {
        issues.push(errorIssue("BALANCE_INVALID", "/current_balance_nullable", "current_balance_nullable must be finite when provided"));
    }
    return issues;
};
export const validateVirtualCreditAccount = (input, options) => {
    const schemaValidator = requireSchemaValidator(VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("VirtualCreditAccount", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-virtual-credit-account.js.map