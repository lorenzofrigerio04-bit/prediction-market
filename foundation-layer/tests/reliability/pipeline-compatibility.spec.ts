import { describe, expect, it } from "vitest";
import { makeMarketDraftPipeline } from "../publishing/publishing-fixtures.js";
import { DeterministicTitleGenerator } from "@/publishing/titles/implementations/deterministic-title-generator.js";
import { DeterministicResolutionSummaryGenerator } from "@/publishing/summaries/implementations/deterministic-resolution-summary-generator.js";
import { DeterministicRulebookCompiler } from "@/publishing/rulebook/implementations/deterministic-rulebook-compiler.js";
import { DeterministicTimePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-time-policy-renderer.js";
import { DeterministicSourcePolicyRenderer } from "@/publishing/rendering/implementations/deterministic-source-policy-renderer.js";
import { DeterministicEdgeCaseRenderer } from "@/publishing/rendering/implementations/deterministic-edge-case-renderer.js";
import { DeterministicPublishableCandidateBuilder } from "@/publishing/candidate/implementations/deterministic-publishable-candidate-builder.js";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createTimestamp } from "@/value-objects/timestamp.vo.js";
import {
  DatasetScope,
  DeterministicModuleHealthEvaluator,
  DeterministicPipelineHealthEvaluator,
  DeterministicReleaseGateEvaluator,
  InMemoryObservabilityEmitter,
  ObservabilityEventType,
  PriorityLevel,
  RegressionStatus,
  SeverityLevel,
  TargetModule,
  createArtifactReference,
  createCorrelationId,
  createGoldenDatasetEntry,
  createGoldenDatasetEntryId,
  createObservabilityEvent,
  createObservabilityEventId,
  validateGoldenDatasetEntry,
  validateObservabilityEvent,
  validatePipelineHealthSnapshot,
  validateReleaseGateEvaluation,
} from "@/reliability/index.js";

const buildPublishableCandidate = () => {
  const pipeline = makeMarketDraftPipeline();
  const titleSet = new DeterministicTitleGenerator().generate(pipeline);
  const resolutionSummary = new DeterministicResolutionSummaryGenerator().generate(pipeline);
  const rulebookCompilation = new DeterministicRulebookCompiler(
    new DeterministicTimePolicyRenderer(),
    new DeterministicSourcePolicyRenderer(),
    new DeterministicEdgeCaseRenderer(),
  ).compile({ pipeline });
  const candidate = new DeterministicPublishableCandidateBuilder().build({
    pipeline,
    title_set: titleSet,
    resolution_summary: resolutionSummary,
    rulebook_compilation: rulebookCompilation,
  });
  return { pipeline, candidate };
};

describe("Reliability full pipeline compatibility", () => {
  it("validates compatibility with full pipeline artifacts", () => {
    const { pipeline, candidate } = buildPublishableCandidate();
    const entry = createGoldenDatasetEntry({
      id: createGoldenDatasetEntryId("gde_fullpipe001"),
      version: createEntityVersion(1),
      dataset_scope: DatasetScope.FULL_PIPELINE,
      input_artifact_refs: [
        createArtifactReference({
          module_name: TargetModule.FOUNDATION_LAYER,
          artifact_type: "foundation_candidate_market",
          artifact_id: pipeline.foundation_candidate_market.id,
          artifact_version_nullable: 1,
          uri_nullable: null,
        }),
        createArtifactReference({
          module_name: TargetModule.MARKET_DESIGN_ENGINE,
          artifact_type: "market_draft_pipeline",
          artifact_id: "market_draft_pipeline",
          artifact_version_nullable: 1,
          uri_nullable: null,
        }),
      ],
      expected_output_refs: [
        createArtifactReference({
          module_name: TargetModule.PUBLISHING_ENGINE,
          artifact_type: "publishable_candidate",
          artifact_id: candidate.id,
          artifact_version_nullable: 1,
          uri_nullable: null,
        }),
        createArtifactReference({
          module_name: TargetModule.EDITORIAL_CONTROL_PLANE,
          artifact_type: "review_queue_entry",
          artifact_id: "rqe_compatibl001",
          artifact_version_nullable: 1,
          uri_nullable: null,
        }),
      ],
      expected_invariants: [
        {
          code: "CROSS_MODULE_TYPE_COMPATIBLE",
          description: "Cross-module artifacts must stay type-compatible",
          path: "/pipeline",
        },
      ],
      category_tags: ["compatibility", "full_pipeline"],
      priority_level: PriorityLevel.HIGH,
      active: true,
    });

    const moduleMetrics = [
      ...new DeterministicModuleHealthEvaluator().evaluate(TargetModule.FOUNDATION_LAYER, [
        { metric_name: "foundation_integrity", metric_value: 0.99 },
      ]),
      ...new DeterministicModuleHealthEvaluator().evaluate(TargetModule.SOURCE_INTELLIGENCE_LAYER, [
        { metric_name: "source_intelligence_integrity", metric_value: 0.97 },
      ]),
      ...new DeterministicModuleHealthEvaluator().evaluate(TargetModule.EVENT_INTELLIGENCE_LAYER, [
        { metric_name: "event_intelligence_integrity", metric_value: 0.96 },
      ]),
      ...new DeterministicModuleHealthEvaluator().evaluate(TargetModule.MARKET_DESIGN_ENGINE, [
        { metric_name: "market_design_integrity", metric_value: 0.98 },
      ]),
      ...new DeterministicModuleHealthEvaluator().evaluate(TargetModule.PUBLISHING_ENGINE, [
        { metric_name: "publishing_integrity", metric_value: 0.97 },
      ]),
      ...new DeterministicModuleHealthEvaluator().evaluate(TargetModule.EDITORIAL_CONTROL_PLANE, [
        { metric_name: "editorial_integrity", metric_value: 0.95 },
      ]),
    ];

    const pipelineSnapshot = new DeterministicPipelineHealthEvaluator().evaluate({
      covered_modules: [
        TargetModule.FOUNDATION_LAYER,
        TargetModule.SOURCE_INTELLIGENCE_LAYER,
        TargetModule.EVENT_INTELLIGENCE_LAYER,
        TargetModule.MARKET_DESIGN_ENGINE,
        TargetModule.PUBLISHING_ENGINE,
        TargetModule.EDITORIAL_CONTROL_PLANE,
      ],
      module_metrics: moduleMetrics,
      pass_rate: 0.97,
      regression_status: RegressionStatus.STABLE,
    });

    const releaseEvaluation = new DeterministicReleaseGateEvaluator().evaluate({
      target_scope: DatasetScope.FULL_PIPELINE,
      schema_gate_pass: true,
      validator_gate_pass: true,
      test_gate_pass: true,
      regression_gate_pass: true,
      compatibility_gate_pass: true,
      readiness_gate_pass: true,
    });

    const event = createObservabilityEvent({
      id: createObservabilityEventId("obe_compatibl001"),
      version: createEntityVersion(1),
      event_type: ObservabilityEventType.COMPATIBILITY_CHECK_EXECUTED,
      module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
      correlation_id: createCorrelationId("corr_compatibl01"),
      emitted_at: createTimestamp("2026-03-08T11:10:00.000Z"),
      severity: SeverityLevel.LOW,
      payload_summary: {
        summary_type: "compatibility_result",
        values: {
          foundation: true,
          source_intelligence: true,
          event_intelligence: true,
          market_design: true,
          publishing: true,
          editorial: true,
        },
      },
      trace_refs: [{ trace_id: "trace-compatibility", span_id_nullable: null, parent_trace_id_nullable: null }],
      diagnostic_tags: ["compatibility", "full_pipeline"],
    });

    const emitter = new InMemoryObservabilityEmitter();
    emitter.emit(event);

    expect(validateGoldenDatasetEntry(entry).isValid).toBe(true);
    expect(validatePipelineHealthSnapshot(pipelineSnapshot).isValid).toBe(true);
    expect(validateReleaseGateEvaluation(releaseEvaluation).isValid).toBe(true);
    expect(validateObservabilityEvent(event).isValid).toBe(true);
    expect(emitter.listEvents()).toHaveLength(1);
  });
});
