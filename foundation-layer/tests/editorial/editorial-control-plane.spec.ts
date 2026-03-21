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
  FinalReadinessStatus,
  PriorityLevel,
  QueueStatus,
  ReasonCode,
  ReviewStatus,
  ApprovalScope,
  ActionType,
  OverrideType,
  createApprovalDecision,
  createApprovalDecisionId,
  createApprovalScore,
  createAuditCorrelationId,
  createAuditRecord,
  createAuditRecordId,
  createAuditReferenceId,
  createBlockingFlag,
  createChangedFieldReference,
  createControlledStateTransition,
  createControlledStateTransitionId,
  createEditorialActorId,
  createEditorialReview,
  createEditorialReviewId,
  createGatingSummary,
  createManualOverride,
  createManualOverrideId,
  createPublicationReadyArtifact,
  createPublicationReadyArtifactId,
  createRequiredAction,
  createRejectionDecision,
  createRejectionDecisionId,
  createReviewQueueEntry,
  createReviewQueueEntryId,
  createRevisionRecord,
  createRevisionRecordId,
  createSeveritySummary,
  createOverrideScope,
  validateApprovalDecision,
  validateAuditRecord,
  validateControlledStateTransition,
  validateEditorialReview,
  validateManualOverride,
  validatePublicationReadyArtifact,
  validatePublishableCandidateEditorialCompatibility,
  validateReviewQueueEntry,
  validateRevisionRecord,
  DeterministicControlledStateTransitionManager,
  DeterministicPublicationReadinessEvaluator,
  DeterministicRevisionTracker,
} from "@/index.js";

const buildPublishableCandidate = () => {
  const pipeline = makeMarketDraftPipeline();
  const titleSet = new DeterministicTitleGenerator().generate(pipeline);
  const resolutionSummary = new DeterministicResolutionSummaryGenerator().generate(pipeline);
  const rulebookCompilation = new DeterministicRulebookCompiler(
    new DeterministicTimePolicyRenderer(),
    new DeterministicSourcePolicyRenderer(),
    new DeterministicEdgeCaseRenderer(),
  ).compile({ pipeline });
  return new DeterministicPublishableCandidateBuilder().build({
    pipeline,
    title_set: titleSet,
    resolution_summary: resolutionSummary,
    rulebook_compilation: rulebookCompilation,
  });
};

const makeQueueEntry = (candidateId: string, unresolvedBlocking = false) =>
  createReviewQueueEntry({
    id: createReviewQueueEntryId("rqe_abcdefghi1"),
    version: createEntityVersion(1),
    publishable_candidate_id: candidateId as never,
    queue_status: QueueStatus.PENDING_REVIEW,
    priority_level: PriorityLevel.NORMAL,
    entered_queue_at: createTimestamp("2026-03-05T10:00:00.000Z"),
    assigned_reviewer_nullable: createEditorialActorId("actor_editorial01"),
    queue_reason: ReasonCode.EDITORIAL_CONCERN,
    blocking_flags: [
      createBlockingFlag({
        code: ReasonCode.BLOCKING_POLICY,
        message: "Policy item pending",
        path: "/policy",
        is_resolved: !unresolvedBlocking,
      }),
    ],
    warnings: [
      {
        code: ReasonCode.QUALITY_CONCERN,
        message: "Quality warning",
        path: "/quality",
      },
    ],
  });

const makeReview = (candidateId: string) =>
  createEditorialReview({
    id: createEditorialReviewId("edrev_abcdefghi1"),
    version: createEntityVersion(1),
    publishable_candidate_id: candidateId as never,
    review_status: ReviewStatus.APPROVED_FOR_GATE,
    reviewer_id: createEditorialActorId("actor_editorial02"),
    reviewed_at: createTimestamp("2026-03-05T12:00:00.000Z"),
    findings: [
      {
        code: ReasonCode.QUALITY_CONCERN,
        severity: "medium",
        message: "Clarify source wording",
        path: "/rulebook",
      },
    ],
    required_actions: [
      createRequiredAction({
        code: ReasonCode.QUALITY_CONCERN,
        description: "Improve wording clarity",
        owner: "editorial",
        is_mandatory: false,
      }),
    ],
    review_notes_nullable: null,
    severity_summary: createSeveritySummary({ low: 0, medium: 1, high: 0, critical: 0 }),
  });

describe("Editorial & Control Plane v1", () => {
  it("valid ReviewQueueEntry", () => {
    const candidate = buildPublishableCandidate();
    const entry = makeQueueEntry(candidate.id);
    expect(validateReviewQueueEntry(entry).isValid).toBe(true);
  });

  it("invalid ReviewQueueEntry with missing candidate reference", () => {
    const bad = {
      ...makeQueueEntry("pcnd_validcand01"),
      publishable_candidate_id: "",
    } as never;
    const report = validateReviewQueueEntry(bad);
    expect(report.isValid).toBe(false);
  });

  it("valid EditorialReview", () => {
    const candidate = buildPublishableCandidate();
    const review = makeReview(candidate.id);
    expect(validateEditorialReview(review).isValid).toBe(true);
  });

  it("invalid EditorialReview with inconsistent severity/findings", () => {
    const candidate = buildPublishableCandidate();
    const bad = {
      ...makeReview(candidate.id),
      severity_summary: createSeveritySummary({ low: 1, medium: 0, high: 0, critical: 0 }),
    };
    const report = validateEditorialReview(bad);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "SEVERITY_SUMMARY_MISMATCH")).toBe(true);
  });

  it("valid ApprovalDecision", () => {
    const candidate = buildPublishableCandidate();
    const decision = createApprovalDecision({
      id: createApprovalDecisionId("apd_abcdefghi1"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      approved_by: createEditorialActorId("actor_editorial03"),
      approved_at: createTimestamp("2026-03-05T13:00:00.000Z"),
      approval_scope: ApprovalScope.FULL_PUBLICATION_READINESS,
      approval_notes_nullable: null,
      publication_readiness_score: createApprovalScore(91),
    });
    expect(validateApprovalDecision(decision).isValid).toBe(true);
  });

  it("invalid approval decision with out-of-range readiness score", () => {
    const candidate = buildPublishableCandidate();
    const bad = {
      id: createApprovalDecisionId("apd_abcdefghi2"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      approved_by: createEditorialActorId("actor_editorial03"),
      approved_at: createTimestamp("2026-03-05T13:00:00.000Z"),
      approval_scope: ApprovalScope.CONTENT_ONLY,
      approval_notes_nullable: null,
      publication_readiness_score: 120,
    } as never;
    const report = validateApprovalDecision(bad);
    expect(report.isValid).toBe(false);
  });

  it("valid RejectionDecision", () => {
    const candidate = buildPublishableCandidate();
    const rejection = createRejectionDecision({
      id: createRejectionDecisionId("rjd_abcdefghi1"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      rejected_by: createEditorialActorId("actor_editorial04"),
      rejected_at: createTimestamp("2026-03-05T14:00:00.000Z"),
      rejection_reason_codes: [ReasonCode.POLICY_NON_COMPLIANCE],
      rejection_notes_nullable: "Policy issue",
      rework_required: true,
    });
    expect(rejection.rework_required).toBe(true);
  });

  it("valid ManualOverride", () => {
    const override = createManualOverride({
      id: createManualOverrideId("ovr_abcdefghi1"),
      version: createEntityVersion(1),
      target_entity_type: "ApprovalDecision",
      target_entity_id: "apd_abcdefghi1",
      override_type: OverrideType.DECISION_OVERRIDE,
      initiated_by: createEditorialActorId("actor_editorial05"),
      initiated_at: createTimestamp("2026-03-05T15:00:00.000Z"),
      override_reason: "Escalated policy exception",
      override_scope: createOverrideScope({
        affected_fields: ["/approval_scope"],
        allow_readiness_gate_bypass: false,
      }),
      expiration_nullable: null,
      audit_reference_id: createAuditReferenceId("aref_abcdefghi1"),
    });
    expect(validateManualOverride(override).isValid).toBe(true);
  });

  it("invalid ManualOverride without reason", () => {
    const bad = {
      ...createManualOverride({
        id: createManualOverrideId("ovr_abcdefghi2"),
        version: createEntityVersion(1),
        target_entity_type: "ApprovalDecision",
        target_entity_id: "apd_abcdefghi1",
        override_type: OverrideType.DECISION_OVERRIDE,
        initiated_by: createEditorialActorId("actor_editorial05"),
        initiated_at: createTimestamp("2026-03-05T15:00:00.000Z"),
        override_reason: "temporary",
        override_scope: createOverrideScope({
          affected_fields: ["/approval_scope"],
          allow_readiness_gate_bypass: false,
        }),
        expiration_nullable: null,
        audit_reference_id: createAuditReferenceId("aref_abcdefghi2"),
      }),
      override_reason: "",
    };
    const report = validateManualOverride(bad);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "MISSING_OVERRIDE_REASON")).toBe(true);
  });

  it("valid AuditRecord and immutable", () => {
    const audit = createAuditRecord({
      id: createAuditRecordId("aud_abcdefghi1"),
      version: createEntityVersion(1),
      actor_id: createEditorialActorId("actor_editorial06"),
      action_type: ActionType.REVIEW_COMPLETED,
      target_type: "EditorialReview",
      target_id: "edrev_abcdefghi1",
      action_timestamp: createTimestamp("2026-03-05T16:00:00.000Z"),
      action_payload_summary: "Review completed with one medium finding",
      reason_codes: [ReasonCode.QUALITY_CONCERN],
      correlation_id: createAuditCorrelationId("corr_abcdefghi1"),
    });
    expect(validateAuditRecord(audit).isValid).toBe(true);
    expect(Object.isFrozen(audit)).toBe(true);
  });

  it("invalid audit record without correlation id", () => {
    const bad = {
      ...createAuditRecord({
        id: createAuditRecordId("aud_abcdefghi2"),
        version: createEntityVersion(1),
        actor_id: createEditorialActorId("actor_editorial06"),
        action_type: ActionType.READINESS_EVALUATED,
        target_type: "PublicationReadyArtifact",
        target_id: "prad_abcdefghi1",
        action_timestamp: createTimestamp("2026-03-05T16:00:00.000Z"),
        action_payload_summary: "Readiness evaluated with strict checks",
        reason_codes: [ReasonCode.CONSISTENCY_FAILURE],
        correlation_id: createAuditCorrelationId("corr_abcdefghi2"),
      }),
      correlation_id: "",
    } as never;
    const report = validateAuditRecord(bad);
    expect(report.isValid).toBe(false);
  });

  it("append-only validation for RevisionRecord", () => {
    const tracker = new DeterministicRevisionTracker();
    const first = createRevisionRecord({
      id: createRevisionRecordId("rev_abcdefghi1"),
      version: createEntityVersion(1),
      target_entity_type: "PublicationReadyArtifact",
      target_entity_id: "prad_abcdefghi1",
      revision_number: 1,
      changed_fields: [
        createChangedFieldReference({
          field_path: "/gating_summary/readiness_status",
          previous_value_summary: "not_ready",
          new_value_summary: "conditionally_ready",
        }),
      ],
      changed_by: createEditorialActorId("actor_editorial07"),
      changed_at: createTimestamp("2026-03-05T16:05:00.000Z"),
      revision_reason: "Initial readiness calculation",
    });
    tracker.append(first);
    expect(() =>
      tracker.append({
        ...first,
        id: createRevisionRecordId("rev_abcdefghi2"),
        revision_number: 1,
      }),
    ).toThrow("REVISION_NUMBER_NOT_MONOTONIC");
  });

  it("invalid revision record with empty changed fields", () => {
    const bad = {
      ...createRevisionRecord({
        id: createRevisionRecordId("rev_abcdefghi3"),
        version: createEntityVersion(1),
        target_entity_type: "PublicationReadyArtifact",
        target_entity_id: "prad_abcdefghi1",
        revision_number: 1,
        changed_fields: [
          createChangedFieldReference({
            field_path: "/a",
            previous_value_summary: "x",
            new_value_summary: "y",
          }),
        ],
        changed_by: createEditorialActorId("actor_editorial07"),
        changed_at: createTimestamp("2026-03-05T16:06:00.000Z"),
        revision_reason: "sample",
      }),
      changed_fields: [],
    };
    const report = validateRevisionRecord(bad as never);
    expect(report.isValid).toBe(false);
  });

  it("valid PublicationReadyArtifact", () => {
    const candidate = buildPublishableCandidate();
    const artifact = createPublicationReadyArtifact({
      id: createPublicationReadyArtifactId("prad_abcdefghi1"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      final_readiness_status: FinalReadinessStatus.APPROVED,
      approved_artifacts: [createApprovalDecisionId("apd_abcdefghi1")],
      gating_summary: createGatingSummary({
        readiness_status: FinalReadinessStatus.APPROVED,
        has_valid_approval: true,
        has_terminal_rejection: false,
        unresolved_blocking_flags_count: 0,
        checks: ["approval_present", "no_terminal_rejection", "no_unresolved_blockers"],
      }),
      generated_at: createTimestamp("2026-03-05T17:00:00.000Z"),
      generated_by: createEditorialActorId("actor_editorial08"),
      handoff_notes_nullable: null,
    });
    expect(validatePublicationReadyArtifact(artifact).isValid).toBe(true);
  });

  it("invalid PublicationReadyArtifact with unresolved blocking flags", () => {
    const candidate = buildPublishableCandidate();
    const artifact = createPublicationReadyArtifact({
      id: createPublicationReadyArtifactId("prad_abcdefghi2"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      final_readiness_status: FinalReadinessStatus.CONDITIONALLY_READY,
      approved_artifacts: [],
      gating_summary: createGatingSummary({
        readiness_status: FinalReadinessStatus.CONDITIONALLY_READY,
        has_valid_approval: false,
        has_terminal_rejection: false,
        unresolved_blocking_flags_count: 1,
        checks: ["blocking_flags_present"],
      }),
      generated_at: createTimestamp("2026-03-05T17:00:00.000Z"),
      generated_by: createEditorialActorId("actor_editorial08"),
      handoff_notes_nullable: "Pending one blocker",
    });
    const report = validatePublicationReadyArtifact(artifact);
    expect(report.isValid).toBe(false);
  });

  it("valid controlled state transition with audit linkage", () => {
    const candidate = buildPublishableCandidate();
    const queueEntry = makeQueueEntry(candidate.id);
    const transition = createControlledStateTransition({
      id: createControlledStateTransitionId("ctr_abcdefghi1"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      from_state: "in_review",
      to_state: "approved",
      transition_at: createTimestamp("2026-03-05T18:00:00.000Z"),
      transitioned_by: createEditorialActorId("actor_editorial09"),
      transition_reason: "All checks passed",
      audit_record_id: createAuditRecordId("aud_abcdefghi3"),
    });
    const auditRecord = createAuditRecord({
      id: createAuditRecordId("aud_abcdefghi3"),
      version: createEntityVersion(1),
      actor_id: createEditorialActorId("actor_editorial09"),
      action_type: ActionType.STATE_TRANSITION_EXECUTED,
      target_type: "ControlledStateTransition",
      target_id: transition.id,
      action_timestamp: createTimestamp("2026-03-05T18:00:00.000Z"),
      action_payload_summary: "Transition executed from in_review to approved",
      reason_codes: [ReasonCode.CONSISTENCY_FAILURE],
      correlation_id: createAuditCorrelationId("corr_abcdefghi3"),
    });
    const artifact = createPublicationReadyArtifact({
      id: createPublicationReadyArtifactId("prad_abcdefghi3"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      final_readiness_status: FinalReadinessStatus.APPROVED,
      approved_artifacts: [createApprovalDecisionId("apd_abcdefghi9")],
      gating_summary: createGatingSummary({
        readiness_status: FinalReadinessStatus.APPROVED,
        has_valid_approval: true,
        has_terminal_rejection: false,
        unresolved_blocking_flags_count: 0,
        checks: ["ok"],
      }),
      generated_at: createTimestamp("2026-03-05T18:00:00.000Z"),
      generated_by: createEditorialActorId("actor_editorial09"),
      handoff_notes_nullable: null,
    });
    const report = validateControlledStateTransition(transition, {
      context: {
        queue_entry: queueEntry,
        approvals: [
          createApprovalDecision({
            id: createApprovalDecisionId("apd_abcdefghi9"),
            version: createEntityVersion(1),
            publishable_candidate_id: candidate.id,
            approved_by: createEditorialActorId("actor_editorial03"),
            approved_at: createTimestamp("2026-03-05T13:00:00.000Z"),
            approval_scope: ApprovalScope.FULL_PUBLICATION_READINESS,
            approval_notes_nullable: null,
            publication_readiness_score: createApprovalScore(92),
          }),
        ],
        rejections: [],
        manual_overrides: [],
        audit_record: auditRecord,
        publication_ready_artifact_nullable: artifact,
      },
    });
    expect(report.isValid).toBe(true);
  });

  it("invalid controlled state transition without audit record", () => {
    const candidate = buildPublishableCandidate();
    const queueEntry = makeQueueEntry(candidate.id);
    const transition = createControlledStateTransition({
      id: createControlledStateTransitionId("ctr_abcdefghi2"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      from_state: "in_review",
      to_state: "approved",
      transition_at: createTimestamp("2026-03-05T18:10:00.000Z"),
      transitioned_by: createEditorialActorId("actor_editorial10"),
      transition_reason: "Missing audit should fail",
      audit_record_id: createAuditRecordId("aud_abcdefghi4"),
    });
    const report = validateControlledStateTransition(transition, {
      context: {
        queue_entry: queueEntry,
        approvals: [],
        rejections: [],
        manual_overrides: [],
        audit_record: null,
        publication_ready_artifact_nullable: null,
      },
    });
    expect(report.isValid).toBe(false);
  });

  it("invalid coexistence of approval-ready and terminal rejection state", () => {
    const candidate = buildPublishableCandidate();
    const queueEntry = makeQueueEntry(candidate.id);
    const artifact = createPublicationReadyArtifact({
      id: createPublicationReadyArtifactId("prad_abcdefghi4"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      final_readiness_status: FinalReadinessStatus.APPROVED,
      approved_artifacts: [createApprovalDecisionId("apd_abcdefghi5")],
      gating_summary: createGatingSummary({
        readiness_status: FinalReadinessStatus.APPROVED,
        has_valid_approval: true,
        has_terminal_rejection: true,
        unresolved_blocking_flags_count: 0,
        checks: ["conflict_case"],
      }),
      generated_at: createTimestamp("2026-03-05T18:20:00.000Z"),
      generated_by: createEditorialActorId("actor_editorial11"),
      handoff_notes_nullable: null,
    });
    const transition = createControlledStateTransition({
      id: createControlledStateTransitionId("ctr_abcdefghi3"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      from_state: "in_review",
      to_state: "approved",
      transition_at: createTimestamp("2026-03-05T18:20:00.000Z"),
      transitioned_by: createEditorialActorId("actor_editorial11"),
      transition_reason: "Conflict case",
      audit_record_id: createAuditRecordId("aud_abcdefghi5"),
    });
    const report = validateControlledStateTransition(transition, {
      context: {
        queue_entry: queueEntry,
        approvals: [
          createApprovalDecision({
            id: createApprovalDecisionId("apd_abcdefghi5"),
            version: createEntityVersion(1),
            publishable_candidate_id: candidate.id,
            approved_by: createEditorialActorId("actor_editorial03"),
            approved_at: createTimestamp("2026-03-05T13:00:00.000Z"),
            approval_scope: ApprovalScope.FULL_PUBLICATION_READINESS,
            approval_notes_nullable: null,
            publication_readiness_score: createApprovalScore(90),
          }),
        ],
        rejections: [
          createRejectionDecision({
            id: createRejectionDecisionId("rjd_abcdefghi2"),
            version: createEntityVersion(1),
            publishable_candidate_id: candidate.id,
            rejected_by: createEditorialActorId("actor_editorial04"),
            rejected_at: createTimestamp("2026-03-05T14:00:00.000Z"),
            rejection_reason_codes: [ReasonCode.EDITORIAL_CONCERN],
            rejection_notes_nullable: null,
            rework_required: true,
          }),
        ],
        manual_overrides: [],
        audit_record: createAuditRecord({
          id: createAuditRecordId("aud_abcdefghi5"),
          version: createEntityVersion(1),
          actor_id: createEditorialActorId("actor_editorial11"),
          action_type: ActionType.STATE_TRANSITION_EXECUTED,
          target_type: "ControlledStateTransition",
          target_id: "ctr_abcdefghi3",
          action_timestamp: createTimestamp("2026-03-05T18:20:00.000Z"),
          action_payload_summary: "Transition attempted with rejection conflict",
          reason_codes: [ReasonCode.EDITORIAL_CONCERN],
          correlation_id: createAuditCorrelationId("corr_abcdefghi5"),
        }),
        publication_ready_artifact_nullable: artifact,
      },
    });
    expect(report.isValid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "APPROVAL_REJECTION_CONFLICT")).toBe(true);
  });

  it("readiness failure with terminal rejection", () => {
    const candidate = buildPublishableCandidate();
    const evaluator = new DeterministicPublicationReadinessEvaluator();
    const queueEntry = makeQueueEntry(candidate.id);
    const artifact = createPublicationReadyArtifact({
      id: createPublicationReadyArtifactId("prad_abcdefghi6"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      final_readiness_status: FinalReadinessStatus.APPROVED,
      approved_artifacts: [createApprovalDecisionId("apd_abcdefghi6")],
      gating_summary: createGatingSummary({
        readiness_status: FinalReadinessStatus.APPROVED,
        has_valid_approval: true,
        has_terminal_rejection: true,
        unresolved_blocking_flags_count: 0,
        checks: ["terminal_rejection_present"],
      }),
      generated_at: createTimestamp("2026-03-05T19:00:00.000Z"),
      generated_by: createEditorialActorId("actor_editorial12"),
      handoff_notes_nullable: null,
    });
    expect(() =>
      evaluator.evaluate({
        queue_entry: queueEntry,
        approvals: [
          createApprovalDecision({
            id: createApprovalDecisionId("apd_abcdefghi6"),
            version: createEntityVersion(1),
            publishable_candidate_id: candidate.id,
            approved_by: createEditorialActorId("actor_editorial03"),
            approved_at: createTimestamp("2026-03-05T13:00:00.000Z"),
            approval_scope: ApprovalScope.FULL_PUBLICATION_READINESS,
            approval_notes_nullable: null,
            publication_readiness_score: createApprovalScore(94),
          }),
        ],
        rejections: [
          createRejectionDecision({
            id: createRejectionDecisionId("rjd_abcdefghi6"),
            version: createEntityVersion(1),
            publishable_candidate_id: candidate.id,
            rejected_by: createEditorialActorId("actor_editorial13"),
            rejected_at: createTimestamp("2026-03-05T18:59:00.000Z"),
            rejection_reason_codes: [ReasonCode.POLICY_NON_COMPLIANCE],
            rejection_notes_nullable: null,
            rework_required: true,
          }),
        ],
        artifact,
      }),
    ).toThrow("READINESS_INCOMPATIBLE_WITH_REJECTION");
  });

  it("readiness success only when at least one valid approval exists", () => {
    const candidate = buildPublishableCandidate();
    const evaluator = new DeterministicPublicationReadinessEvaluator();
    const queueEntry = makeQueueEntry(candidate.id);
    const artifact = createPublicationReadyArtifact({
      id: createPublicationReadyArtifactId("prad_abcdefghi7"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      final_readiness_status: FinalReadinessStatus.APPROVED,
      approved_artifacts: [createApprovalDecisionId("apd_abcdefghi7")],
      gating_summary: createGatingSummary({
        readiness_status: FinalReadinessStatus.APPROVED,
        has_valid_approval: true,
        has_terminal_rejection: false,
        unresolved_blocking_flags_count: 0,
        checks: ["approval_present"],
      }),
      generated_at: createTimestamp("2026-03-05T19:10:00.000Z"),
      generated_by: createEditorialActorId("actor_editorial12"),
      handoff_notes_nullable: null,
    });
    const result = evaluator.evaluate({
      queue_entry: queueEntry,
      approvals: [
        createApprovalDecision({
          id: createApprovalDecisionId("apd_abcdefghi7"),
          version: createEntityVersion(1),
          publishable_candidate_id: candidate.id,
          approved_by: createEditorialActorId("actor_editorial03"),
          approved_at: createTimestamp("2026-03-05T13:00:00.000Z"),
          approval_scope: ApprovalScope.FULL_PUBLICATION_READINESS,
          approval_notes_nullable: null,
          publication_readiness_score: createApprovalScore(97),
        }),
      ],
      rejections: [],
      artifact,
    });
    expect(result.final_readiness_status).toBe(FinalReadinessStatus.APPROVED);
  });

  it("compatibility test with PublishableCandidate from Publishing Engine", () => {
    const candidate = buildPublishableCandidate();
    const queueEntry = makeQueueEntry(candidate.id);
    const compatibility = validatePublishableCandidateEditorialCompatibility({
      candidate,
      queue_entry: queueEntry,
    });
    expect(compatibility.isValid).toBe(true);
  });

  it("deterministic controlled transition manager enforces rules", () => {
    const candidate = buildPublishableCandidate();
    const manager = new DeterministicControlledStateTransitionManager();
    const queueEntry = makeQueueEntry(candidate.id, true);
    const transition = createControlledStateTransition({
      id: createControlledStateTransitionId("ctr_abcdefghi4"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      from_state: "in_review",
      to_state: "approved",
      transition_at: createTimestamp("2026-03-05T20:00:00.000Z"),
      transitioned_by: createEditorialActorId("actor_editorial14"),
      transition_reason: "Hard checks must fail",
      audit_record_id: createAuditRecordId("aud_abcdefghi8"),
    });
    const artifact = createPublicationReadyArtifact({
      id: createPublicationReadyArtifactId("prad_abcdefghi8"),
      version: createEntityVersion(1),
      publishable_candidate_id: candidate.id,
      final_readiness_status: FinalReadinessStatus.APPROVED,
      approved_artifacts: [createApprovalDecisionId("apd_abcdefghi8")],
      gating_summary: createGatingSummary({
        readiness_status: FinalReadinessStatus.APPROVED,
        has_valid_approval: true,
        has_terminal_rejection: false,
        unresolved_blocking_flags_count: 1,
        checks: ["unresolved_blocking"],
      }),
      generated_at: createTimestamp("2026-03-05T20:00:00.000Z"),
      generated_by: createEditorialActorId("actor_editorial14"),
      handoff_notes_nullable: null,
    });
    expect(() =>
      manager.validateTransition(transition, {
        queue_entry: queueEntry,
        approvals: [
          createApprovalDecision({
            id: createApprovalDecisionId("apd_abcdefghi8"),
            version: createEntityVersion(1),
            publishable_candidate_id: candidate.id,
            approved_by: createEditorialActorId("actor_editorial03"),
            approved_at: createTimestamp("2026-03-05T13:00:00.000Z"),
            approval_scope: ApprovalScope.FULL_PUBLICATION_READINESS,
            approval_notes_nullable: null,
            publication_readiness_score: createApprovalScore(93),
          }),
        ],
        rejections: [],
        manual_overrides: [],
        audit_record: createAuditRecord({
          id: createAuditRecordId("aud_abcdefghi8"),
          version: createEntityVersion(1),
          actor_id: createEditorialActorId("actor_editorial14"),
          action_type: ActionType.STATE_TRANSITION_EXECUTED,
          target_type: "ControlledStateTransition",
          target_id: transition.id,
          action_timestamp: createTimestamp("2026-03-05T20:00:00.000Z"),
          action_payload_summary: "Transition blocked by unresolved flags",
          reason_codes: [ReasonCode.BLOCKING_POLICY],
          correlation_id: createAuditCorrelationId("corr_abcdefghi8"),
        }),
        publication_ready_artifact_nullable: artifact,
      }),
    ).toThrow("CONTROLLED_TRANSITION_BLOCKING_FLAGS_UNRESOLVED");
  });
});
