import { describe, expect, it } from "vitest";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createConfidenceScore } from "@/value-objects/confidence-score.vo.js";
import { createMarketDraftPipelineId, createResolutionSummaryId } from "@/publishing/value-objects/publishing-ids.vo.js";
import { createResolutionSummary } from "@/publishing/summaries/entities/resolution-summary.entity.js";
import { validateResolutionSummary } from "@/publishing/validators/validate-resolution-summary.js";
describe("ResolutionSummary", () => {
    it("accepts a valid summary", () => {
        const summary = createResolutionSummary({
            id: createResolutionSummaryId("rsum_validsum001"),
            version: createEntityVersion(1),
            market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
            one_line_resolution_summary: "Resolves Yes if the defined condition is satisfied before deadline on top-priority sources.",
            summary_basis: {
                resolution_rule_ref: "contract:BINARY",
                source_hierarchy_ref: "shs_validsource1",
                deadline_ref: "dlr_validdeadl1",
                basis_points: ["source hierarchy rank 1", "event deadline policy"],
            },
            summary_confidence: createConfidenceScore(0.8),
        });
        expect(validateResolutionSummary(summary).isValid).toBe(true);
    });
    it("rejects empty summary", () => {
        expect(() => createResolutionSummary({
            id: createResolutionSummaryId("rsum_invalid001"),
            version: createEntityVersion(1),
            market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
            one_line_resolution_summary: " ",
            summary_basis: {
                resolution_rule_ref: "contract:BINARY",
                source_hierarchy_ref: "shs_validsource1",
                deadline_ref: "dlr_validdeadl1",
                basis_points: ["basis"],
            },
            summary_confidence: createConfidenceScore(0.8),
        })).toThrow();
    });
    it("validator rejects structurally underspecified basis", () => {
        const summary = createResolutionSummary({
            id: createResolutionSummaryId("rsum_invalid002"),
            version: createEntityVersion(1),
            market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
            one_line_resolution_summary: "Summary without explicit resolve behavior.",
            summary_basis: {
                resolution_rule_ref: "rule:custom",
                source_hierarchy_ref: "custom-source-ref",
                deadline_ref: "custom-deadline-ref",
                basis_points: ["single point"],
            },
            summary_confidence: createConfidenceScore(0.8),
        });
        const report = validateResolutionSummary(summary);
        expect(report.isValid).toBe(false);
        expect(report.issues.some((issue) => issue.code === "INVALID_RESOLUTION_RULE_REFERENCE" ||
            issue.code === "INVALID_SOURCE_HIERARCHY_REFERENCE" ||
            issue.code === "INVALID_DEADLINE_REFERENCE" ||
            issue.code === "INSUFFICIENT_SUMMARY_BASIS_POINTS")).toBe(true);
    });
});
//# sourceMappingURL=resolution-summary.spec.js.map