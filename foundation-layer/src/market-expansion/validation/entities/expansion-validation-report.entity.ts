import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import type {
  ExpansionValidationReportId,
  MarketFamilyId,
} from "../../value-objects/market-expansion-ids.vo.js";
import { createExpansionNote, type ExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";

export type CheckedInvariant = Readonly<{
  code: string;
  passed: boolean;
  description: string;
}>;

export type ExpansionValidationReport = Readonly<{
  id: ExpansionValidationReportId;
  version: EntityVersion;
  family_id: MarketFamilyId;
  validation_status: ExpansionValidationStatus;
  blocking_issues: readonly ExpansionNote[];
  warnings: readonly ExpansionNote[];
  checked_invariants: readonly CheckedInvariant[];
  compatibility_notes: readonly ExpansionNote[];
}>;

export const createExpansionValidationReport = (
  input: ExpansionValidationReport,
): ExpansionValidationReport => {
  if (!Object.values(ExpansionValidationStatus).includes(input.validation_status)) {
    throw new ValidationError("INVALID_EXPANSION_VALIDATION_REPORT", "validation_status is invalid");
  }
  if (
    input.validation_status === ExpansionValidationStatus.INVALID &&
    input.blocking_issues.length === 0
  ) {
    throw new ValidationError(
      "INVALID_EXPANSION_VALIDATION_REPORT",
      "invalid validation_status requires blocking issues",
    );
  }
  return deepFreeze({
    ...input,
    blocking_issues: input.blocking_issues.map(createExpansionNote),
    warnings: input.warnings.map(createExpansionNote),
    checked_invariants: deepFreeze(
      input.checked_invariants.map((invariant) =>
        deepFreeze({
          code: invariant.code,
          passed: invariant.passed,
          description: invariant.description,
        }),
      ),
    ),
    compatibility_notes: input.compatibility_notes.map(createExpansionNote),
  });
};
