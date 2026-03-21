import { describe, expect, it } from "vitest";
import { ajv } from "@/validators/ajv/ajv-instance.js";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createTimestamp } from "@/value-objects/timestamp.vo.js";
import { requireSchemaValidator } from "@/validators/common/validation-result.js";
import * as foundation from "@/index.js";
import {
  EDITORIAL_FEEDBACK_SIGNAL_SCHEMA_ID,
  EDITORIAL_FEEDBACK_SCHEMA_ID,
  FEEDBACK_AGGREGATION_SCHEMA_ID,
  FEEDBACK_SIGNAL_SCHEMA_ID,
  GENERATOR_IMPROVEMENT_ARTIFACT_SCHEMA_ID,
  IMPROVEMENT_ARTIFACT_SCHEMA_ID,
  LEARNING_AGGREGATION_SCHEMA_ID,
  LEARNING_COMPATIBILITY_RESULT_SCHEMA_ID,
  LEARNING_INSIGHT_SCHEMA_ID,
  LEARNING_RECOMMENDATION_SCHEMA_ID,
  OVERRIDE_PATTERN_SCHEMA_ID,
  RECOMMENDATION_SET_SCHEMA_ID,
  REJECTION_PATTERN_SCHEMA_ID,
  RELIABILITY_FEEDBACK_SCHEMA_ID,
  RELIABILITY_LEARNING_SIGNAL_SCHEMA_ID,
  AggregationStatus,
  DeterministicEditorialFeedbackAdapter,
  DeterministicReliabilityFeedbackAdapter,
  EditorialDecisionLearningAdapter,
  EditorialReviewLearningAdapter,
  FeedbackReasonCode,
  LearningCompatibilityStatus,
  FeedbackType,
  LearningFeedbackOverrideType,
  ImprovementArtifactType,
  LearningCompatibilityTarget,
  LearningInsightStatus,
  MarketDraftLearningAdapter,
  PatternStatus,
  PublishableCandidateLearningAdapter,
  RecommendationStatus,
  ReleaseGateLearningAdapter,
  ReleaseImpact,
  ReliabilityReportLearningAdapter,
  createEditorialFeedback,
  createOverridePattern,
  createRejectionPattern,
  createRejectionPatternId,
  createOverridePatternId,
  createCorrelationId,
  createEditorialFeedbackSignal,
  createEditorialFeedbackSignalId,
  createImprovementArtifact,
  createImprovementArtifactId,
  createLearningAggregation,
  createLearningAggregationId,
  createLearningInsight,
  createLearningInsightId,
  createLearningRecommendation,
  createLearningRecommendationId,
  createRecommendationSet,
  createFeedbackAggregation,
  createGeneratorImprovementArtifact,
  createReliabilityLearningSignal,
  createReliabilityLearningSignalId,
  createReliabilityFeedback,
  validateFeedbackSignal,
  validateEditorialFeedback,
  validateFeedbackAggregation,
  validateReliabilityFeedback,
  validateRecommendationSet,
  validateGeneratorImprovementArtifact,
  validateRejectionPattern,
  validateOverridePattern,
  validateEditorialFeedbackSignal,
  validateImprovementArtifact,
  validateLearningAggregation,
  validateLearningCompatibility,
  validateLearningInsight,
  validateLearningRecommendation,
  validateReliabilityLearningSignal,
} from "@/learning-feedback/index.js";

const makeEditorialSignal = () =>
  createEditorialFeedbackSignal({
    id: createEditorialFeedbackSignalId("lfs_editsig001"),
    version: createEntityVersion(1),
    correlation_id: createCorrelationId("corr_learning001"),
    feedback_type: FeedbackType.REVISION_REQUEST,
    decision_refs: ["dec_ref_001"],
    reason_codes: [FeedbackReasonCode.QUALITY_IMPROVEMENT],
    notes: ["improve evidence linkage"],
    created_at: createTimestamp("2026-03-08T12:00:00.000Z"),
  });

const makeReliabilitySignal = () =>
  createReliabilityLearningSignal({
    id: createReliabilityLearningSignalId("lrs_relsig001"),
    version: createEntityVersion(1),
    correlation_id: createCorrelationId("corr_learning001"),
    release_impact: ReleaseImpact.MEDIUM,
    safe_to_ignore: false,
    ignored_ready: false,
    active_pattern: true,
    pattern_status: PatternStatus.ACTIVE,
    occurrence_count: 2,
    evidence_refs: ["evidence_1"],
    created_at: createTimestamp("2026-03-08T12:01:00.000Z"),
  });

const makeAggregation = () =>
  createLearningAggregation({
    id: createLearningAggregationId("lag_aggr001"),
    version: createEntityVersion(1),
    correlation_id: createCorrelationId("corr_learning001"),
    aggregation_status: AggregationStatus.ACTIVE,
    input_signal_refs: ["lfs_editsig001", "lrs_relsig001"],
    aggregated_insight_refs: ["lin_insight001"],
    generated_at: createTimestamp("2026-03-08T12:02:00.000Z"),
  });

const makeInsight = () =>
  createLearningInsight({
    id: createLearningInsightId("lin_insight001"),
    version: createEntityVersion(1),
    correlation_id: createCorrelationId("corr_learning001"),
    insight_status: LearningInsightStatus.VALIDATED,
    title: "Editorial revisions improve deterministic consistency",
    supporting_refs: ["lfs_editsig001"],
    derived_recommendation_refs: ["lrc_reco001"],
    created_at: createTimestamp("2026-03-08T12:03:00.000Z"),
  });

const makeRecommendation = () =>
  createLearningRecommendation({
    id: createLearningRecommendationId("lrc_reco001"),
    version: createEntityVersion(1),
    correlation_id: createCorrelationId("corr_learning001"),
    status: RecommendationStatus.DRAFT,
    recommendation_text: "Increase strictness on revision reason checks",
    blocking_dependency_refs: [],
    planned_action_refs: ["action_1"],
    generated_at: createTimestamp("2026-03-08T12:04:00.000Z"),
  });

const makeImprovement = () =>
  createImprovementArtifact({
    id: createImprovementArtifactId("lia_improv001"),
    version: createEntityVersion(1),
    correlation_id: createCorrelationId("corr_learning001"),
    artifact_type: ImprovementArtifactType.SAFETY_HARDENING,
    derived_from_refs: ["lin_insight001"],
    safety_constraints: ["must preserve deterministic semantics"],
    rollout_notes: ["phase rollout over two releases"],
    created_at: createTimestamp("2026-03-08T12:05:00.000Z"),
  });

const makeRejectionPattern = () =>
  createRejectionPattern({
    id: createRejectionPatternId("lrp_pattern001"),
    status: PatternStatus.ACTIVE,
    reason_codes: ["missing_evidence"],
    supporting_refs: ["evidence_1"],
  });

const makeOverridePattern = () =>
  createOverridePattern({
    id: createOverridePatternId("lop_pattern001"),
    status: PatternStatus.ACTIVE,
    override_type: LearningFeedbackOverrideType.MANUAL,
    supporting_refs: ["decision_1"],
  });

describe("learning-feedback module", () => {
  it("1) validates a coherent editorial feedback signal", () => {
    expect(validateEditorialFeedbackSignal(makeEditorialSignal()).isValid).toBe(true);
    expect(validateEditorialFeedback(makeEditorialSignal()).isValid).toBe(true);
  });

  it("2) rejects editorial approval with blocking reason codes", () => {
    expect(() =>
      createEditorialFeedbackSignal({
        ...makeEditorialSignal(),
        feedback_type: FeedbackType.APPROVAL,
        reason_codes: [FeedbackReasonCode.BLOCKING_DEPENDENCY],
      }),
    ).toThrow();
  });

  it("3) rejects editorial rejection without reason codes", () => {
    const invalid = {
      ...makeEditorialSignal(),
      feedback_type: FeedbackType.REJECTION,
      reason_codes: [],
    };
    expect(validateEditorialFeedbackSignal(invalid).isValid).toBe(false);
  });

  it("4) validates reliability signal with active pattern", () => {
    expect(validateReliabilityLearningSignal(makeReliabilitySignal()).isValid).toBe(true);
    expect(validateReliabilityFeedback(makeReliabilitySignal()).isValid).toBe(true);
  });

  it("5) rejects active reliability pattern when occurrence_count is zero", () => {
    const invalid = { ...makeReliabilitySignal(), occurrence_count: 0 };
    expect(validateReliabilityLearningSignal(invalid).isValid).toBe(false);
  });

  it("6) rejects high/critical release impact when safe-to-ignore semantics are enabled", () => {
    const invalid = {
      ...makeReliabilitySignal(),
      release_impact: ReleaseImpact.CRITICAL,
      safe_to_ignore: true,
    };
    expect(validateReliabilityLearningSignal(invalid).isValid).toBe(false);
  });

  it("7) validates learning aggregation with required input refs", () => {
    expect(validateLearningAggregation(makeAggregation()).isValid).toBe(true);
    expect(validateFeedbackAggregation(makeAggregation()).isValid).toBe(true);
  });

  it("8) rejects learning aggregation when input_signal_refs are empty", () => {
    const invalid = { ...makeAggregation(), input_signal_refs: [] };
    expect(validateLearningAggregation(invalid).isValid).toBe(false);
  });

  it("9) rejects learning insight when supporting_refs are empty", () => {
    const invalid = { ...makeInsight(), supporting_refs: [] };
    expect(validateLearningInsight(invalid).isValid).toBe(false);
  });

  it("10) rejects READY recommendation with blocking dependency refs", () => {
    const invalid = {
      ...makeRecommendation(),
      status: RecommendationStatus.READY,
      blocking_dependency_refs: ["dep_blocking"],
    };
    expect(validateLearningRecommendation(invalid).isValid).toBe(false);
    expect(validateRecommendationSet(invalid).isValid).toBe(false);
  });

  it("11) rejects improvement artifacts without safety constraints", () => {
    const invalid = { ...makeImprovement(), safety_constraints: [] };
    expect(validateImprovementArtifact(invalid).isValid).toBe(false);
    expect(validateGeneratorImprovementArtifact(invalid).isValid).toBe(false);
  });

  it("12) validates rejection and override patterns", () => {
    expect(validateRejectionPattern(makeRejectionPattern()).isValid).toBe(true);
    expect(validateOverridePattern(makeOverridePattern()).isValid).toBe(true);
    expect(
      validateRejectionPattern({ ...makeRejectionPattern(), supporting_refs: [] }).isValid,
    ).toBe(false);
    expect(validateOverridePattern({ ...makeOverridePattern(), supporting_refs: [] }).isValid).toBe(
      false,
    );
  });

  it("13) creates compatible adapters for all required targets", () => {
    const editorialSignal = makeEditorialSignal();
    const reliabilitySignal = makeReliabilitySignal();
    const aggregation = makeAggregation();
    const insight = makeInsight();
    const recommendation = makeRecommendation();
    const improvement = makeImprovement();

    const outputs = [
      new EditorialReviewLearningAdapter().adapt({ editorial_signal: editorialSignal, insight }),
      new EditorialDecisionLearningAdapter().adapt({ editorial_signal: editorialSignal, recommendation }),
      new ReliabilityReportLearningAdapter().adapt({ reliability_signal: reliabilitySignal, insight }),
      new ReleaseGateLearningAdapter().adapt({ reliability_signal: reliabilitySignal, recommendation }),
      new PublishableCandidateLearningAdapter().adapt({ recommendation, improvement }),
      new MarketDraftLearningAdapter().adapt({ aggregation, insight }),
    ];

    expect(outputs.map((item) => item.target)).toEqual([
      LearningCompatibilityTarget.EDITORIAL_REVIEW_LEARNING,
      LearningCompatibilityTarget.EDITORIAL_DECISION_LEARNING,
      LearningCompatibilityTarget.RELIABILITY_REPORT_LEARNING,
      LearningCompatibilityTarget.RELEASE_GATE_LEARNING,
      LearningCompatibilityTarget.PUBLISHABLE_CANDIDATE_LEARNING,
      LearningCompatibilityTarget.MARKET_DRAFT_LEARNING,
    ]);
    for (const output of outputs) {
      expect(validateLearningCompatibility(output).isValid).toBe(true);
    }
  });

  it("14) rejects compatibility when readiness mismatches status", () => {
    const valid = new MarketDraftLearningAdapter().adapt({
      aggregation: makeAggregation(),
      insight: makeInsight(),
    });
    const invalid = {
      ...valid,
      status: LearningCompatibilityStatus.INCOMPATIBLE,
    };
    expect(validateLearningCompatibility(invalid).isValid).toBe(false);
  });

  it("15) aligns schema and entity validation for correlation id format", () => {
    const validator = ajv.getSchema(EDITORIAL_FEEDBACK_SIGNAL_SCHEMA_ID)!;
    const payload = {
      ...makeEditorialSignal(),
      correlation_id: "invalid-correlation-id",
    };
    expect(validator(payload)).toBe(false);
    expect(
      validateFeedbackSignal({
        signal_type: foundation.learningFeedback.SignalType.EDITORIAL,
        payload: makeEditorialSignal(),
      }).isValid,
    ).toBe(true);
  });

  it("16) registers all learning-feedback schemas in AJV", () => {
    const schemaIds = [
      FEEDBACK_SIGNAL_SCHEMA_ID,
      EDITORIAL_FEEDBACK_SCHEMA_ID,
      EDITORIAL_FEEDBACK_SIGNAL_SCHEMA_ID,
      REJECTION_PATTERN_SCHEMA_ID,
      OVERRIDE_PATTERN_SCHEMA_ID,
      RELIABILITY_FEEDBACK_SCHEMA_ID,
      RELIABILITY_LEARNING_SIGNAL_SCHEMA_ID,
      FEEDBACK_AGGREGATION_SCHEMA_ID,
      LEARNING_AGGREGATION_SCHEMA_ID,
      LEARNING_INSIGHT_SCHEMA_ID,
      RECOMMENDATION_SET_SCHEMA_ID,
      LEARNING_RECOMMENDATION_SCHEMA_ID,
      GENERATOR_IMPROVEMENT_ARTIFACT_SCHEMA_ID,
      IMPROVEMENT_ARTIFACT_SCHEMA_ID,
      LEARNING_COMPATIBILITY_RESULT_SCHEMA_ID,
    ];
    for (const schemaId of schemaIds) {
      expect(() => requireSchemaValidator(schemaId)).not.toThrow();
    }
  });

  it("17) keeps root and namespace exports stable", () => {
    const editorialViaAdapter = new DeterministicEditorialFeedbackAdapter().adapt(makeEditorialSignal());
    const reliabilityViaAdapter = new DeterministicReliabilityFeedbackAdapter().adapt(
      makeReliabilitySignal(),
    );

    expect(editorialViaAdapter.id).toBe(makeEditorialSignal().id);
    expect(reliabilityViaAdapter.id).toBe(makeReliabilitySignal().id);

    expect(createEditorialFeedback(makeEditorialSignal()).id).toBe(makeEditorialSignal().id);
    expect(createReliabilityFeedback(makeReliabilitySignal()).id).toBe(makeReliabilitySignal().id);
    expect(createFeedbackAggregation(makeAggregation()).id).toBe(makeAggregation().id);
    expect(createRecommendationSet(makeRecommendation()).id).toBe(makeRecommendation().id);
    expect(createGeneratorImprovementArtifact(makeImprovement()).id).toBe(makeImprovement().id);

    expect(typeof foundation.validateLearningCompatibility).toBe("function");
    expect(typeof foundation.learningFeedback.validateLearningCompatibility).toBe("function");
    expect(typeof foundation.learningFeedback.learningFeedbackSchemas).toBe("object");
    expect(typeof foundation.learningFeedback.validateFeedbackSignal).toBe("function");
  });
});
