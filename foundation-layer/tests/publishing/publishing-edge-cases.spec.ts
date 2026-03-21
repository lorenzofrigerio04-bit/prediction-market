import { describe, expect, it } from "vitest";
import { createSourcePolicyRender } from "@/publishing/rendering/entities/source-policy-render.entity.js";
import { createTimePolicyRender } from "@/publishing/rendering/entities/time-policy-render.entity.js";
import { validateSourcePolicyRender } from "@/publishing/validators/validate-source-policy-render.js";
import { validateTimePolicyRender } from "@/publishing/validators/validate-time-policy-render.js";
import { createResolutionSummary } from "@/publishing/summaries/entities/resolution-summary.entity.js";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createConfidenceScore } from "@/value-objects/confidence-score.vo.js";
import { createMarketDraftPipelineId, createResolutionSummaryId } from "@/publishing/value-objects/publishing-ids.vo.js";
import { createPublishableCandidate } from "@/publishing/candidate/entities/publishable-candidate.entity.js";
import { PublishableCandidateStatus } from "@/publishing/enums/publishable-candidate-status.enum.js";

describe("Publishing edge cases", () => {
  it("flags missing source policy render fields", () => {
    const render = createSourcePolicyRender({
      selected_source_priority: ["1. OFFICIAL"],
      source_policy_text: "Primary source is official",
      fallback_policy_text_nullable: null,
    });
    expect(validateSourcePolicyRender(render).isValid).toBe(true);
    expect(validateSourcePolicyRender({ ...render, selected_source_priority: [] }).isValid).toBe(false);
  });

  it("flags missing time policy timezone", () => {
    const render = createTimePolicyRender({
      timezone: "UTC",
      deadline_text: "Deadline at 2026-07-31T10:00:00.000Z",
      close_time_text: "Close at 2026-07-31T09:00:00.000Z",
      cutoff_text_nullable: null,
      policy_notes: ["Stable policy"],
      metadata: {},
    });
    expect(validateTimePolicyRender(render).isValid).toBe(true);
    expect(validateTimePolicyRender({ ...render, timezone: " " }).isValid).toBe(false);
  });

  it("rejects invalid confidence range", () => {
    expect(() =>
      createResolutionSummary({
        id: createResolutionSummaryId("rsum_badscore01"),
        version: createEntityVersion(1),
        market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
        one_line_resolution_summary: "Summary",
        summary_basis: {
          resolution_rule_ref: "contract:BINARY",
          source_hierarchy_ref: "shs_source0001",
          deadline_ref: "dlr_deadline001",
          basis_points: ["point"],
        },
        summary_confidence: createConfidenceScore(1.2),
      }),
    ).toThrow();
  });

  it("rejects invalid structural readiness score range", () => {
    expect(() =>
      createPublishableCandidate({
        id: "pcnd_validcand01" as never,
        version: createEntityVersion(1),
        market_draft_pipeline_id: "mdp_validpipe001" as never,
        title_set_id: "tset_validtitle01" as never,
        resolution_summary_id: "rsum_validsum001" as never,
        rulebook_compilation_id: "rbcmp_validcomp01" as never,
        candidate_status: PublishableCandidateStatus.DRAFT,
        structural_readiness_score: 120,
        blocking_issues: [],
        warnings: [],
        compatibility_metadata: {},
      }),
    ).toThrow();
  });
});
