import { describe, expect, it } from "vitest";
import { ContractType } from "../../src/market-design/enums/contract-type.enum.js";
import { createOutcomeDefinition } from "../../src/market-design/outcomes/entities/outcome-definition.entity.js";
import { OutcomeExclusivityPolicy } from "../../src/market-design/enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../src/market-design/enums/outcome-exhaustiveness-policy.enum.js";
import { createOutcomeId } from "../../src/value-objects/outcome-id.vo.js";
import { createOutcomeKey } from "../../src/market-design/value-objects/outcome-key.vo.js";
import { createAdvancedOutcomeGenerationResult } from "../../src/frontier-markets/outcomes/entities/advanced-outcome-generation-result.entity.js";
import { createAdvancedOutcomeGenerationResultId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import { createValidationNote } from "../../src/frontier-markets/value-objects/frontier-text.vo.js";
import { validateAdvancedOutcomeGenerationResult } from "../../src/frontier-markets/validators/validate-advanced-outcome-generation-result.js";

const makeOutcome = (id: string, key: string, label: string) =>
  createOutcomeDefinition({
    id: createOutcomeId(id),
    outcome_key: createOutcomeKey(key),
    display_label: label,
    semantic_definition: `Definition ${label}`,
    ordering_index_nullable: 0,
    range_definition_nullable: null,
    active: true,
  });

const makeValidAdvancedOutcomeResult = () =>
  createAdvancedOutcomeGenerationResult({
    id: createAdvancedOutcomeGenerationResultId("fgr_frontier001"),
    contract_type: ContractType.RACE,
    generated_outcomes: [
      makeOutcome("out_fronta001", "alpha", "Alpha"),
      makeOutcome("out_frontb001", "beta", "Beta"),
    ],
    validation_notes: [createValidationNote("deterministic output")],
    exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
    exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
    generation_confidence: 0.9,
  });

describe("AdvancedOutcomeGenerationResult", () => {
  it("valid AdvancedOutcomeGenerationResult", () => {
    const report = validateAdvancedOutcomeGenerationResult(makeValidAdvancedOutcomeResult());
    expect(report.isValid).toBe(true);
  });

  it("invalid AdvancedOutcomeGenerationResult with empty outcomes", () => {
    const invalid = {
      ...makeValidAdvancedOutcomeResult(),
      generated_outcomes: [],
    };
    const report = validateAdvancedOutcomeGenerationResult(invalid);
    expect(report.isValid).toBe(false);
  });

  it("rejects non-frontier contract type for advanced outcomes", () => {
    expect(() =>
      createAdvancedOutcomeGenerationResult({
        ...makeValidAdvancedOutcomeResult(),
        contract_type: ContractType.BINARY as never,
      }),
    ).toThrow();
  });
});
