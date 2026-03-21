import { describe, expect, it } from "vitest";
import { ContractType } from "../../src/market-design/enums/contract-type.enum.js";
import { createAdvancedContractValidationReport } from "../../src/frontier-markets/validation/entities/advanced-contract-validation-report.entity.js";
import { AdvancedValidationStatus } from "../../src/frontier-markets/enums/advanced-validation-status.enum.js";
import { createAdvancedContractValidationReportId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import { createInvariantCheck } from "../../src/frontier-markets/value-objects/invariant-check.vo.js";
import { createCompatibilityNote } from "../../src/frontier-markets/value-objects/frontier-text.vo.js";
import { validateAdvancedContractValidationReport } from "../../src/frontier-markets/validators/validate-advanced-contract-validation-report.js";

describe("AdvancedContractValidationReport", () => {
  it("valid AdvancedContractValidationReport", () => {
    const reportEntity = createAdvancedContractValidationReport({
      id: createAdvancedContractValidationReportId("fvr_frontier001"),
      contract_type: ContractType.SEQUENCE,
      validation_status: AdvancedValidationStatus.VALID,
      blocking_issues: [],
      warnings: [],
      checked_invariants: [
        createInvariantCheck({
          code: "SEQUENCE_MIN_TARGETS",
          passed: true,
          message: "sequence has enough targets",
        }),
      ],
      compatibility_notes: [createCompatibilityNote("compatible with deterministic publishing bridge")],
    });
    const report = validateAdvancedContractValidationReport(reportEntity);
    expect(report.isValid).toBe(true);
  });

  it("rejects non-frontier contract type for advanced report", () => {
    expect(() =>
      createAdvancedContractValidationReport({
        id: createAdvancedContractValidationReportId("fvr_frontier002"),
        contract_type: ContractType.BINARY as never,
        validation_status: AdvancedValidationStatus.VALID,
        blocking_issues: [],
        warnings: [],
        checked_invariants: [
          createInvariantCheck({
            code: "SEQUENCE_MIN_TARGETS",
            passed: true,
            message: "sequence has enough targets",
          }),
        ],
        compatibility_notes: [createCompatibilityNote("compatible with deterministic publishing bridge")],
      }),
    ).toThrow();
  });
});
