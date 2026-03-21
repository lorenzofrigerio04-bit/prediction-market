import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import {
  FUTURE_CONTRACT_TYPES,
  type FutureContractType,
} from "../../../market-design/enums/contract-type.enum.js";
import { AdvancedValidationStatus } from "../../enums/advanced-validation-status.enum.js";
import type { AdvancedContractValidationReportId } from "../../value-objects/frontier-market-ids.vo.js";
import { createInvariantCheck, type InvariantCheck } from "../../value-objects/invariant-check.vo.js";
import { createCompatibilityNote, type CompatibilityNote } from "../../value-objects/frontier-text.vo.js";

export type ValidationMessage = Readonly<{
  code: string;
  message: string;
  path: string;
}>;

export type AdvancedContractValidationReport = Readonly<{
  id: AdvancedContractValidationReportId;
  contract_type: FutureContractType;
  validation_status: AdvancedValidationStatus;
  blocking_issues: readonly ValidationMessage[];
  warnings: readonly ValidationMessage[];
  checked_invariants: readonly InvariantCheck[];
  compatibility_notes: readonly CompatibilityNote[];
}>;

const normalizeMessage = (input: ValidationMessage, field: string): ValidationMessage => {
  if (input.code.trim().length === 0 || input.message.trim().length === 0 || input.path.trim().length === 0) {
    throw new ValidationError("INVALID_ADVANCED_VALIDATION_REPORT", `${field} entries must be non-empty`);
  }
  return {
    code: input.code.trim(),
    message: input.message.trim(),
    path: input.path.trim(),
  };
};

export const createAdvancedContractValidationReport = (
  input: AdvancedContractValidationReport,
): AdvancedContractValidationReport => {
  const futureContractTypes = new Set<FutureContractType>(FUTURE_CONTRACT_TYPES);
  if (!futureContractTypes.has(input.contract_type)) {
    throw new ValidationError(
      "INVALID_ADVANCED_VALIDATION_REPORT",
      "contract_type must be a frontier advanced contract type",
    );
  }
  if (!Object.values(AdvancedValidationStatus).includes(input.validation_status)) {
    throw new ValidationError("INVALID_ADVANCED_VALIDATION_REPORT", "validation_status is invalid");
  }
  if (input.checked_invariants.length === 0) {
    throw new ValidationError(
      "INVALID_ADVANCED_VALIDATION_REPORT",
      "checked_invariants must not be empty",
    );
  }
  return deepFreeze({
    ...input,
    blocking_issues: input.blocking_issues.map((item) => normalizeMessage(item, "blocking_issues")),
    warnings: input.warnings.map((item) => normalizeMessage(item, "warnings")),
    checked_invariants: input.checked_invariants.map(createInvariantCheck),
    compatibility_notes: input.compatibility_notes.map(createCompatibilityNote),
  });
};
