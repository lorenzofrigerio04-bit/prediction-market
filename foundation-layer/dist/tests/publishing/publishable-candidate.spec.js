import { describe, expect, it } from "vitest";
import { makeMarketDraftPipeline } from "./publishing-fixtures.js";
import { DeterministicTitleGenerator } from "@/publishing/titles/implementations/deterministic-title-generator.js";
import { DeterministicResolutionSummaryGenerator } from "@/publishing/summaries/implementations/deterministic-resolution-summary-generator.js";
import { DeterministicEdgeCaseRenderer } from "@/publishing/rendering/implementations/deterministic-edge-case-renderer.js";
import { DeterministicSourcePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-source-policy-renderer.js";
import { DeterministicTimePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-time-policy-renderer.js";
import { DeterministicRulebookCompiler } from "@/publishing/rulebook/implementations/deterministic-rulebook-compiler.js";
import { DeterministicPublishableCandidateBuilder } from "@/publishing/candidate/implementations/deterministic-publishable-candidate-builder.js";
import { validatePublishableCandidate } from "@/publishing/validators/validate-publishable-candidate.js";
import { createPublishableCandidate } from "@/publishing/candidate/entities/publishable-candidate.entity.js";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { PublishableCandidateStatus } from "@/publishing/enums/publishable-candidate-status.enum.js";
import { RulebookSectionType } from "@/publishing/enums/rulebook-section-type.enum.js";
describe("PublishableCandidate", () => {
    it("accepts valid publishable candidate", () => {
        const pipeline = makeMarketDraftPipeline();
        const titleGenerator = new DeterministicTitleGenerator();
        const summaryGenerator = new DeterministicResolutionSummaryGenerator();
        const compiler = new DeterministicRulebookCompiler(new DeterministicTimePolicyRenderer(), new DeterministicSourcePolicyRenderer(), new DeterministicEdgeCaseRenderer());
        const builder = new DeterministicPublishableCandidateBuilder();
        const candidate = builder.build({
            pipeline,
            title_set: titleGenerator.generate(pipeline),
            resolution_summary: summaryGenerator.generate(pipeline),
            rulebook_compilation: compiler.compile({ pipeline }),
        });
        expect(validatePublishableCandidate(candidate).isValid).toBe(true);
    });
    it("invalid publishable candidate with missing linked artifacts", () => {
        const invalid = createPublishableCandidate({
            id: "pcnd_invalidcand1",
            version: createEntityVersion(1),
            market_draft_pipeline_id: "mdp_validpipe001",
            title_set_id: "bad-title-id",
            resolution_summary_id: "bad-summary-id",
            rulebook_compilation_id: "bad-rulebook-id",
            candidate_status: PublishableCandidateStatus.INVALID,
            structural_readiness_score: 0,
            blocking_issues: [{ code: "MISSING_LINKS", message: "Missing linked artifacts", path: "/" }],
            warnings: [],
            compatibility_metadata: {},
        });
        const report = validatePublishableCandidate(invalid);
        expect(report.isValid).toBe(false);
    });
    it("validator rejects candidate when linked rulebook misses required section", () => {
        const pipeline = makeMarketDraftPipeline();
        const titleSet = new DeterministicTitleGenerator().generate(pipeline);
        const resolutionSummary = new DeterministicResolutionSummaryGenerator().generate(pipeline);
        const compilation = new DeterministicRulebookCompiler(new DeterministicTimePolicyRenderer(), new DeterministicSourcePolicyRenderer(), new DeterministicEdgeCaseRenderer()).compile({ pipeline });
        const candidate = new DeterministicPublishableCandidateBuilder().build({
            pipeline,
            title_set: titleSet,
            resolution_summary: resolutionSummary,
            rulebook_compilation: compilation,
        });
        const report = validatePublishableCandidate(candidate, {
            linked_artifacts: {
                title_set_nullable: titleSet,
                resolution_summary_nullable: resolutionSummary,
                rulebook_compilation_nullable: {
                    ...compilation,
                    included_sections: compilation.included_sections.filter((section) => section.section_type !== RulebookSectionType.TIME_POLICY),
                },
            },
        });
        expect(report.isValid).toBe(false);
        expect(report.issues.some((issue) => issue.code === "MISSING_REQUIRED_RULEBOOK_SECTION")).toBe(true);
    });
    it("validator rejects candidate when linked title/summary artifacts are missing", () => {
        const pipeline = makeMarketDraftPipeline();
        const titleSet = new DeterministicTitleGenerator().generate(pipeline);
        const resolutionSummary = new DeterministicResolutionSummaryGenerator().generate(pipeline);
        const compilation = new DeterministicRulebookCompiler(new DeterministicTimePolicyRenderer(), new DeterministicSourcePolicyRenderer(), new DeterministicEdgeCaseRenderer()).compile({ pipeline });
        const candidate = new DeterministicPublishableCandidateBuilder().build({
            pipeline,
            title_set: titleSet,
            resolution_summary: resolutionSummary,
            rulebook_compilation: compilation,
        });
        const report = validatePublishableCandidate(candidate, {
            linked_artifacts: {
                title_set_nullable: null,
                resolution_summary_nullable: null,
                rulebook_compilation_nullable: compilation,
            },
        });
        expect(report.isValid).toBe(false);
        expect(report.issues.some((issue) => issue.code === "MISSING_TITLE_SET_ARTIFACT")).toBe(true);
        expect(report.issues.some((issue) => issue.code === "MISSING_RESOLUTION_SUMMARY_ARTIFACT")).toBe(true);
    });
});
//# sourceMappingURL=publishable-candidate.spec.js.map