import { describe, expect, it } from "vitest";
import { makeMarketDraftPipeline } from "../publishing/publishing-fixtures.js";
import { validateCanonicalEvent } from "@/event-intelligence/validators/validate-canonical-event.js";
import { validateDeadlineResolution } from "@/market-design/deadlines/validators/validate-deadline-resolution.js";
import { validateOutcomeGenerationResult } from "@/market-design/outcomes/validators/validate-outcome-generation-result.js";
import { validateMarketDraftPipeline } from "@/market-design/validators/validate-market-draft-pipeline.js";
import { DeterministicTitleGenerator } from "@/publishing/titles/implementations/deterministic-title-generator.js";
import { DeterministicResolutionSummaryGenerator } from "@/publishing/summaries/implementations/deterministic-resolution-summary-generator.js";
import { DeterministicRulebookCompiler } from "@/publishing/rulebook/implementations/deterministic-rulebook-compiler.js";
import { DeterministicTimePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-time-policy-renderer.js";
import { DeterministicSourcePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-source-policy-renderer.js";
import { DeterministicEdgeCaseRenderer } from "@/publishing/rendering/implementations/deterministic-edge-case-renderer.js";
import { DeterministicPublishableCandidateBuilder } from "@/publishing/candidate/implementations/deterministic-publishable-candidate-builder.js";
import { validateRulebookCompilation } from "@/publishing/validators/validate-rulebook-compilation.js";
import { validatePublishableCandidate } from "@/publishing/validators/validate-publishable-candidate.js";
import { RulebookSectionType } from "@/publishing/enums/rulebook-section-type.enum.js";
const createRulebookCompiler = () => new DeterministicRulebookCompiler(new DeterministicTimePolicyRenderer(), new DeterministicSourcePolicyRenderer(), new DeterministicEdgeCaseRenderer());
describe("Market Design Engine pipeline stabilization", () => {
    it("pipeline end-to-end success case produces publishable output", () => {
        const pipeline = makeMarketDraftPipeline();
        const canonicalEventReport = validateCanonicalEvent(pipeline.canonical_event);
        const marketDraftReport = validateMarketDraftPipeline(pipeline);
        expect(canonicalEventReport.isValid).toBe(true);
        expect(marketDraftReport.isValid).toBe(true);
        const titleSet = new DeterministicTitleGenerator().generate(pipeline);
        const resolutionSummary = new DeterministicResolutionSummaryGenerator().generate(pipeline);
        const rulebookCompilation = createRulebookCompiler().compile({ pipeline });
        const candidate = new DeterministicPublishableCandidateBuilder().build({
            pipeline,
            title_set: titleSet,
            resolution_summary: resolutionSummary,
            rulebook_compilation: rulebookCompilation,
        });
        const publishableReport = validatePublishableCandidate(candidate, {
            linked_artifacts: {
                title_set_nullable: titleSet,
                resolution_summary_nullable: resolutionSummary,
                rulebook_compilation_nullable: rulebookCompilation,
            },
        });
        expect(publishableReport.isValid).toBe(true);
        expect(rulebookCompilation.compilation_metadata.used_foundation_draft).toBe(false);
        expect(rulebookCompilation.included_sections.length).toBeGreaterThanOrEqual(8);
    });
    it("pipeline with invalid event fails in event-intelligence validation and does not publish", () => {
        const pipeline = makeMarketDraftPipeline();
        const invalidCanonicalEvent = {
            ...pipeline.canonical_event,
            supporting_observations: [],
        };
        const eventReport = validateCanonicalEvent(invalidCanonicalEvent);
        expect(eventReport.isValid).toBe(false);
        expect(eventReport.issues.some((issue) => issue.code === "MISSING_SUPPORTING_OBSERVATIONS")).toBe(true);
        let publishableCandidateBuilt = false;
        if (eventReport.isValid) {
            publishableCandidateBuilt = true;
        }
        expect(publishableCandidateBuilt).toBe(false);
    });
    it("pipeline with missing deadline fails at deadline validation and blocks flow", () => {
        const pipeline = makeMarketDraftPipeline();
        const invalidDeadlineResolution = {
            ...pipeline.deadline_resolution,
            event_deadline: undefined,
        };
        const deadlineReport = validateDeadlineResolution(invalidDeadlineResolution);
        expect(deadlineReport.isValid).toBe(false);
        const invalidPipeline = {
            ...pipeline,
            deadline_resolution: invalidDeadlineResolution,
        };
        const pipelineReport = validateMarketDraftPipeline(invalidPipeline);
        expect(pipelineReport.isValid).toBe(false);
        expect(pipelineReport.issues.some((issue) => issue.path === "/deadline_resolution/event_deadline" || issue.path === "/deadline_resolution")).toBe(true);
    });
    it("pipeline with invalid outcome generation fails deterministically", () => {
        const pipeline = makeMarketDraftPipeline();
        const invalidOutcomeResult = {
            ...pipeline.outcome_generation_result,
            outcomes: [pipeline.outcome_generation_result.outcomes[0]],
        };
        const outcomeReport = validateOutcomeGenerationResult(invalidOutcomeResult);
        expect(outcomeReport.isValid).toBe(false);
        expect(outcomeReport.issues.some((issue) => issue.code === "INVALID_BINARY_CARDINALITY")).toBe(true);
        let publishableCandidateBuilt = false;
        if (outcomeReport.isValid) {
            publishableCandidateBuilt = true;
        }
        expect(publishableCandidateBuilt).toBe(false);
    });
    it("pipeline with invalid rulebook section is rejected by publishing validation", () => {
        const pipeline = makeMarketDraftPipeline();
        const titleSet = new DeterministicTitleGenerator().generate(pipeline);
        const resolutionSummary = new DeterministicResolutionSummaryGenerator().generate(pipeline);
        const validCompilation = createRulebookCompiler().compile({ pipeline });
        const invalidCompilation = {
            ...validCompilation,
            included_sections: validCompilation.included_sections.filter((section) => section.section_type !== RulebookSectionType.TIME_POLICY),
        };
        const compilationReport = validateRulebookCompilation(invalidCompilation);
        expect(compilationReport.isValid).toBe(false);
        expect(compilationReport.issues.some((issue) => issue.code === "MISSING_REQUIRED_RULEBOOK_SECTION")).toBe(true);
        const candidate = new DeterministicPublishableCandidateBuilder().build({
            pipeline,
            title_set: titleSet,
            resolution_summary: resolutionSummary,
            rulebook_compilation: validCompilation,
        });
        const publishableReport = validatePublishableCandidate(candidate, {
            linked_artifacts: {
                title_set_nullable: titleSet,
                resolution_summary_nullable: resolutionSummary,
                rulebook_compilation_nullable: invalidCompilation,
            },
        });
        expect(publishableReport.isValid).toBe(false);
        expect(publishableReport.issues.some((issue) => issue.code === "MISSING_REQUIRED_RULEBOOK_SECTION")).toBe(true);
    });
});
//# sourceMappingURL=market-design-engine-pipeline-stabilization.spec.js.map