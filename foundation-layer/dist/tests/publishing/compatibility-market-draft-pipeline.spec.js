import { describe, expect, it } from "vitest";
import { makeMarketDraftPipeline } from "./publishing-fixtures.js";
import { DeterministicTitleGenerator } from "@/publishing/titles/implementations/deterministic-title-generator.js";
import { DeterministicResolutionSummaryGenerator } from "@/publishing/summaries/implementations/deterministic-resolution-summary-generator.js";
import { DeterministicRulebookCompiler } from "@/publishing/rulebook/implementations/deterministic-rulebook-compiler.js";
import { DeterministicTimePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-time-policy-renderer.js";
import { DeterministicSourcePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-source-policy-renderer.js";
import { DeterministicEdgeCaseRenderer } from "@/publishing/rendering/implementations/deterministic-edge-case-renderer.js";
import { DeterministicPublishableCandidateBuilder } from "@/publishing/candidate/implementations/deterministic-publishable-candidate-builder.js";
import { validateTitleSet } from "@/publishing/validators/validate-title-set.js";
import { validateResolutionSummary } from "@/publishing/validators/validate-resolution-summary.js";
import { validateRulebookCompilation } from "@/publishing/validators/validate-rulebook-compilation.js";
import { validatePublishableCandidate } from "@/publishing/validators/validate-publishable-candidate.js";
describe("MarketDraftPipeline compatibility", () => {
    it("builds publishable artifact chain from market-design output", () => {
        const pipeline = makeMarketDraftPipeline();
        const titleSet = new DeterministicTitleGenerator().generate(pipeline);
        const resolutionSummary = new DeterministicResolutionSummaryGenerator().generate(pipeline);
        const rulebookCompilation = new DeterministicRulebookCompiler(new DeterministicTimePolicyRenderer(), new DeterministicSourcePolicyRenderer(), new DeterministicEdgeCaseRenderer()).compile({ pipeline });
        const candidate = new DeterministicPublishableCandidateBuilder().build({
            pipeline,
            title_set: titleSet,
            resolution_summary: resolutionSummary,
            rulebook_compilation: rulebookCompilation,
        });
        expect(validateTitleSet(titleSet).isValid).toBe(true);
        expect(validateResolutionSummary(resolutionSummary).isValid).toBe(true);
        expect(validateRulebookCompilation(rulebookCompilation).isValid).toBe(true);
        expect(validatePublishableCandidate(candidate).isValid).toBe(true);
    });
});
//# sourceMappingURL=compatibility-market-draft-pipeline.spec.js.map