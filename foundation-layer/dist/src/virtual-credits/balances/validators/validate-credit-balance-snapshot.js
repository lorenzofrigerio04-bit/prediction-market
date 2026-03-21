import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { ConsistencyStatus } from "../../enums/consistency-status.enum.js";
import { CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID } from "../../schemas/credit-balance-snapshot.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (!Number.isFinite(input.snapshot_balance)) {
        issues.push(errorIssue("SNAPSHOT_BALANCE_INVALID", "/snapshot_balance", "snapshot_balance must be finite"));
    }
    if (input.consistency_status === ConsistencyStatus.CONSISTENT && input.included_ledger_refs.length === 0) {
        issues.push(errorIssue("SNAPSHOT_CONSISTENT_EMPTY_REFS", "/included_ledger_refs", "consistent snapshots require included_ledger_refs"));
    }
    return issues;
};
export const validateCreditBalanceSnapshot = (input, options) => {
    const schemaValidator = requireSchemaValidator(CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("CreditBalanceSnapshot", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-credit-balance-snapshot.js.map