import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { LedgerEntryType } from "../../enums/ledger-entry-type.enum.js";
import { CREDIT_LEDGER_ENTRY_SCHEMA_ID } from "../../schemas/credit-ledger-entry.schema.js";
const positiveTypes = new Set([
    LedgerEntryType.GRANT_ISSUED,
    LedgerEntryType.GRANT_ACTIVATED,
    LedgerEntryType.BONUS_APPLIED,
]);
const negativeTypes = new Set([
    LedgerEntryType.CONSUMPTION_RESERVED,
    LedgerEntryType.CONSUMPTION_COMMITTED,
    LedgerEntryType.CONSUMPTION_REVERTED,
    LedgerEntryType.EXPIRATION_APPLIED,
]);
const validateInvariants = (input) => {
    const issues = [];
    if (!Number.isFinite(input.amount_delta) || input.amount_delta === 0) {
        issues.push(errorIssue("LEDGER_AMOUNT_DELTA_INVALID", "/amount_delta", "amount_delta must be finite and non-zero"));
    }
    if (!input.immutable) {
        issues.push(errorIssue("LEDGER_ENTRY_IMMUTABLE_REQUIRED", "/immutable", "immutable must be true for audit safety"));
    }
    if (positiveTypes.has(input.entry_type) && input.amount_delta <= 0) {
        issues.push(errorIssue("LEDGER_ENTRY_SIGN_MISMATCH", "/amount_delta", "entry_type requires a positive amount_delta"));
    }
    if (negativeTypes.has(input.entry_type) && input.amount_delta >= 0) {
        issues.push(errorIssue("LEDGER_ENTRY_SIGN_MISMATCH", "/amount_delta", "entry_type requires a negative amount_delta"));
    }
    return issues;
};
export const validateCreditLedgerEntry = (input, options) => {
    const schemaValidator = requireSchemaValidator(CREDIT_LEDGER_ENTRY_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("CreditLedgerEntry", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-credit-ledger-entry.js.map