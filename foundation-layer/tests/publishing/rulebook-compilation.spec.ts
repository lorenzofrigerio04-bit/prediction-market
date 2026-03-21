import { describe, expect, it } from "vitest";
import { DeterministicEdgeCaseRenderer } from "@/publishing/rendering/implementations/deterministic-edge-case-renderer.js";
import { DeterministicSourcePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-source-policy-renderer.js";
import { DeterministicTimePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-time-policy-renderer.js";
import { DeterministicRulebookCompiler } from "@/publishing/rulebook/implementations/deterministic-rulebook-compiler.js";
import { validateRulebookCompilation } from "@/publishing/validators/validate-rulebook-compilation.js";
import { makeMarketDraftPipeline } from "./publishing-fixtures.js";
import { createRulebookCompilation } from "@/publishing/rulebook/entities/rulebook-compilation.entity.js";
import { CompilationStatus } from "@/publishing/enums/compilation-status.enum.js";

describe("RulebookCompilation", () => {
  const compiler = new DeterministicRulebookCompiler(
    new DeterministicTimePolicyRenderer(),
    new DeterministicSourcePolicyRenderer(),
    new DeterministicEdgeCaseRenderer(),
  );

  it("accepts valid compilation with required sections", () => {
    const compilation = compiler.compile({ pipeline: makeMarketDraftPipeline() });
    expect(validateRulebookCompilation(compilation).isValid).toBe(true);
  });

  it("rejects compilation missing required section", () => {
    const validCompilation = compiler.compile({ pipeline: makeMarketDraftPipeline() });
    expect(() =>
      createRulebookCompilation({
        ...validCompilation,
        compilation_status: CompilationStatus.INCOMPLETE,
        included_sections: validCompilation.included_sections.filter(
          (section) => section.section_type !== "TIME_POLICY",
        ),
      }),
    ).toThrow();
  });

  it("rejects duplicate section types", () => {
    const validCompilation = compiler.compile({ pipeline: makeMarketDraftPipeline() });
    const duplicated = [
      ...validCompilation.included_sections,
      validCompilation.included_sections[0],
    ].filter((value): value is NonNullable<typeof value> => value !== undefined);
    const report = validateRulebookCompilation({
      ...validCompilation,
      included_sections: duplicated,
    });
    expect(report.isValid).toBe(false);
  });
});
