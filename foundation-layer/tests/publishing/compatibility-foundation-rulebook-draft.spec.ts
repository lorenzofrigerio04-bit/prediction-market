import { describe, expect, it } from "vitest";
import { makeMarketDraftPipeline } from "./publishing-fixtures.js";
import { toFoundationRulebookDraft } from "@/publishing/rulebook/adapters/foundation-rulebook-draft.adapter.js";
import { DeterministicRulebookCompiler } from "@/publishing/rulebook/implementations/deterministic-rulebook-compiler.js";
import { DeterministicTimePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-time-policy-renderer.js";
import { DeterministicSourcePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-source-policy-renderer.js";
import { DeterministicEdgeCaseRenderer } from "@/publishing/rendering/implementations/deterministic-edge-case-renderer.js";
import { validateRulebookCompilation } from "@/publishing/validators/validate-rulebook-compilation.js";
import type { RulebookDraftContract } from "@/publishing/rulebook/contracts/rulebook-draft.contract.js";

describe("Foundation RulebookDraft compatibility", () => {
  it("adapts MarketDraftPipeline to foundation-compatible rulebook draft", () => {
    const pipeline = makeMarketDraftPipeline();
    const draft: RulebookDraftContract = toFoundationRulebookDraft(pipeline);
    expect(draft.title.length).toBeGreaterThan(0);
    expect(draft.closesAt).toContain("T");
    expect(draft.timezone).toBe("UTC");
  });

  it("compiles using adapted draft without breaking compatibility", () => {
    const pipeline = makeMarketDraftPipeline();
    const draft = toFoundationRulebookDraft(pipeline);
    const compiler = new DeterministicRulebookCompiler(
      new DeterministicTimePolicyRenderer(),
      new DeterministicSourcePolicyRenderer(),
      new DeterministicEdgeCaseRenderer(),
    );
    const compilation = compiler.compile({
      pipeline,
      foundation_rulebook_draft_nullable: draft,
    });
    expect(validateRulebookCompilation(compilation).isValid).toBe(true);
  });
});
