import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { CannibalizationStatus } from "../../enums/cannibalization-status.enum.js";
import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import { createExpansionValidationReport } from "../entities/expansion-validation-report.entity.js";
import type { ExpansionValidator, ExpansionValidatorInput } from "../interfaces/expansion-validator.js";
import { createExpansionValidationReportId } from "../../value-objects/market-expansion-ids.vo.js";

export class DeterministicExpansionValidator implements ExpansionValidator {
  validate(input: ExpansionValidatorInput) {
    const checked_invariants = [
      {
        code: "FLAGSHIP_PRESENT",
        passed: input.family.flagship_market_ref.length > 0,
        description: "family contains exactly one flagship market reference",
      },
      {
        code: "MARKET_REFS_UNIQUE",
        passed:
          new Set([
            input.family.flagship_market_ref,
            ...input.family.satellite_market_refs,
            ...input.family.derivative_market_refs,
          ]).size ===
          1 + input.family.satellite_market_refs.length + input.family.derivative_market_refs.length,
        description: "all market refs in family are unique",
      },
      {
        code: "NO_BLOCKING_CANNIBALIZATION",
        passed: input.cannibalization.check_status !== CannibalizationStatus.BLOCKING,
        description: "family cannot be valid when cannibalization blocking conflicts exist",
      },
    ] as const;
    const blocking_issues = [
      ...checked_invariants.filter((item) => !item.passed).map((item) => `${item.code}: ${item.description}`),
      ...input.cannibalization.blocking_conflicts,
    ];
    const warnings = input.relationships
      .filter((relation) => !relation.blocking_cannibalization)
      .map((relation) => `non-blocking relation present: ${relation.id}`);
    const validation_status =
      blocking_issues.length > 0
        ? ExpansionValidationStatus.INVALID
        : warnings.length > 0
          ? ExpansionValidationStatus.VALID_WITH_WARNINGS
          : ExpansionValidationStatus.VALID;
    const token = createDeterministicToken(`${input.family.id}|${validation_status}`);
    return createExpansionValidationReport({
      id: createExpansionValidationReportId(`mvr_${token}rpt`),
      version: createEntityVersion(1),
      family_id: input.family.id,
      validation_status,
      blocking_issues,
      warnings,
      checked_invariants,
      compatibility_notes: [
        "validation report generated deterministically",
        "compatible with publishing/editorial/live handoff adapters",
      ],
    });
  }
}
