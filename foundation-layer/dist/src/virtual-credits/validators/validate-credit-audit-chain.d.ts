import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { CreditLedgerEntry } from "../ledger/entities/credit-ledger-entry.entity.js";
export declare const validateCreditAuditChain: (entries: readonly CreditLedgerEntry[], options?: ValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-credit-audit-chain.d.ts.map