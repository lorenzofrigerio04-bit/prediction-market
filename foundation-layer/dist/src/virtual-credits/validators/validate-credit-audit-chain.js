import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt } from "../../validators/common/validation-result.js";
const collectIssues = (entries) => {
    const issues = [];
    const seen = new Set();
    for (const [index, entry] of entries.entries()) {
        if (entry.correlation_id.length === 0) {
            issues.push(errorIssue("AUDIT_CHAIN_CORRELATION_REQUIRED", `/entries/${index}/correlation_id`, "correlation_id is required"));
        }
        if (seen.has(entry.id)) {
            issues.push(errorIssue("AUDIT_CHAIN_DUPLICATE_LEDGER_ID", `/entries/${index}/id`, "ledger entry ids must be unique"));
        }
        seen.add(entry.id);
        if (!entry.immutable) {
            issues.push(errorIssue("AUDIT_CHAIN_IMMUTABLE_REQUIRED", `/entries/${index}/immutable`, "audit chain entries must be immutable"));
        }
    }
    return issues;
};
export const validateCreditAuditChain = (entries, options) => buildValidationReport("CreditAuditChain", "virtual-credits-audit", collectIssues(entries), resolveGeneratedAt(options));
//# sourceMappingURL=validate-credit-audit-chain.js.map