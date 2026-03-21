import { describe, expect, it } from "vitest";
import { requireSchemaValidator } from "@/validators/common/validation-result.js";
import {
  CompositeOperationsConsoleCompatibilityAdapter,
  DeterministicActionSurfaceResolver,
  DeterministicArtifactInspectionBuilder,
  DeterministicAuditTimelineBuilder,
  DeterministicCandidateViewBuilder,
  DeterministicConsoleStateResolver,
  DeterministicPermissionAwareViewEvaluator,
  DeterministicQueueViewBuilder,
  DeterministicReadinessPanelBuilder,
  EditorialConsoleCompatibilityAdapter,
  OperationsConsoleActionKey,
  PlatformAccessConsoleCompatibilityAdapter,
  PublicationConsoleCompatibilityAdapter,
  QueueScope,
  ReliabilityConsoleCompatibilityAdapter,
  ReadinessStatus,
  VisibilityStatus,
  createActionConstraint,
  createActionConstraintRef,
  createActionSurface,
  createActionSurfaceId,
  createActorRef,
  createArtifactInspectionView,
  createArtifactInspectionViewId,
  createArtifactRef,
  createAuditTimelineItem,
  createAuditTimelineView,
  createAuditTimelineViewId,
  createBreadcrumbItem,
  createCandidateDetailView,
  createCandidateDetailViewId,
  createCandidateReadinessSnapshot,
  createCandidateRef,
  createConsoleFilterState,
  createConsoleNavigationState,
  createConsoleNavigationStateId,
  createDisplayLabel,
  createFilterToken,
  createOperationsConsoleCompatibilityResultId,
  createPermissionAwareViewState,
  createPermissionAwareViewStateId,
  createPermissionBasis,
  createPermissionEvaluationBasis,
  createQueueEntryRef,
  createQueueEntryView,
  createQueueFilter,
  createQueuePanelView,
  createQueuePanelViewId,
  createQueueSortConfig,
  createQueueSummaryCounts,
  createQueueVisibilityRule,
  createReadinessGatingItem,
  createReadinessPanelView,
  createReadinessPanelViewId,
  createReadinessRecommendedAction,
  createSortField,
  createSummaryCount,
  createWarningMessage,
  queuePanelViewSchema,
  queueEntryViewSchema,
  candidateListViewSchema,
  candidateDetailViewSchema,
  artifactInspectionViewSchema,
  auditTimelineItemSchema,
  auditTimelineViewSchema,
  readinessPanelViewSchema,
  actionSurfaceSchema,
  consoleNavigationStateSchema,
  permissionAwareViewStateSchema,
  validateActionSurface,
  validateArtifactInspectionView,
  validateAuditTimelineView,
  validateCandidateDetailView,
  validateConsoleNavigationState,
  validateOperationsConsoleCompatibility,
  validatePermissionAwareViewState,
  validateQueuePanelView,
  validateReadinessPanelView,
} from "@/operations-console/index.js";
import { EntryType } from "@/operations-console/enums/entry-type.enum.js";
import { ArtifactType } from "@/operations-console/enums/artifact-type.enum.js";
import { PanelKey } from "@/operations-console/enums/panel-key.enum.js";
import { SortDirection } from "@/operations-console/enums/sort-direction.enum.js";
import { FilterOperator } from "@/operations-console/enums/filter-operator.enum.js";
import { ViewScope } from "@/operations-console/enums/view-scope.enum.js";
import { PersistedStatePolicy } from "@/operations-console/enums/persisted-state-policy.enum.js";
import { TimelineActionType } from "@/operations-console/enums/timeline-action-type.enum.js";
import { SeverityLevel } from "@/operations-console/enums/severity-level.enum.js";
import {
  ACTION_SURFACE_SCHEMA_ID,
  ARTIFACT_INSPECTION_VIEW_SCHEMA_ID,
  AUDIT_TIMELINE_ITEM_SCHEMA_ID,
  AUDIT_TIMELINE_VIEW_SCHEMA_ID,
  CANDIDATE_DETAIL_VIEW_SCHEMA_ID,
  CANDIDATE_LIST_VIEW_SCHEMA_ID,
  CONSOLE_NAVIGATION_STATE_SCHEMA_ID,
  PERMISSION_AWARE_VIEW_STATE_SCHEMA_ID,
  QUEUE_ENTRY_VIEW_SCHEMA_ID,
  QUEUE_PANEL_VIEW_SCHEMA_ID,
  READINESS_PANEL_VIEW_SCHEMA_ID,
  SHARED_CONSOLE_SCHEMA_ID,
} from "@/operations-console/schemas/index.js";

const makeQueueEntry = () =>
  createQueueEntryView({
    entry_ref: createQueueEntryRef("qer_consoleentry001"),
    entry_type: EntryType.CANDIDATE,
    display_title: createDisplayLabel("Candidate Queue Entry"),
    status: "pending_review",
    priority: 1,
    created_at: "2026-03-09T10:00:00.000Z",
    owner_nullable: "usr_operator",
    warnings: [createWarningMessage("warning_1")],
    available_actions: [OperationsConsoleActionKey.OPEN_DETAIL],
  });

const makeQueuePanel = () =>
  createQueuePanelView({
    id: createQueuePanelViewId("qpv_consolepanel001"),
    version: "v1.0.0",
    panel_key: PanelKey.QUEUE,
    queue_scope: QueueScope.CANDIDATES,
    entries: [makeQueueEntry()],
    filters: [
      createQueueFilter({
        field: "status",
        operator: FilterOperator.EQ,
        value: createFilterToken("pending_review"),
      }),
    ],
    sort_config: createQueueSortConfig({
      sort_field: createSortField("priority"),
      sort_direction: SortDirection.ASC,
    }),
    summary_counts: createQueueSummaryCounts({
      total: createSummaryCount(1),
      ready: createSummaryCount(0),
      blocked: createSummaryCount(0),
      warnings: createSummaryCount(1),
    }),
    visibility_rules: [
      createQueueVisibilityRule({
        permission_key: "editorial:view",
        expected_visibility: VisibilityStatus.VISIBLE,
      }),
    ],
  });

const makeCandidateDetail = () =>
  createCandidateDetailView({
    id: createCandidateDetailViewId("cdv_candidatedetail001"),
    version: "v1.0.0",
    candidate_ref: createCandidateRef("cdr_candidate001"),
    artifact_sections: [
      {
        artifact_ref: createArtifactRef("arf_candidateartifact001"),
        artifact_type: ArtifactType.CANDIDATE_MARKET,
        section_title: "Core",
        field_count: 3,
      },
    ],
    readiness_snapshot: createCandidateReadinessSnapshot({
      readiness_status: ReadinessStatus.NEEDS_REVIEW,
      blocking_issues: [],
      warnings: [createWarningMessage("needs_manual_review")],
    }),
    linked_audit_refs: [],
    linked_review_refs: [],
    linked_publication_refs: [],
    visible_actions: [OperationsConsoleActionKey.OPEN_DETAIL],
    visibility_status: VisibilityStatus.VISIBLE,
  });

const makeArtifactInspection = () =>
  createArtifactInspectionView({
    id: createArtifactInspectionViewId("aiv_artifactinspect001"),
    version: "v1.0.0",
    artifact_ref: createArtifactRef("arf_candidate_inspection001"),
    artifact_type: ArtifactType.CANDIDATE_MARKET,
    structured_fields: [{ key: "title", value_type: "string", value_summary: "Demo title" }],
    validation_snapshot: { is_valid: true, issue_count: 0, blocking_issue_count: 0 },
    compatibility_snapshot: { is_compatible: true, incompatible_with: [], lossy_fields: [] },
    related_refs: ["cdr_candidate001", "aud_audit001"],
  });

const makeAuditTimeline = () =>
  createAuditTimelineView({
    id: createAuditTimelineViewId("atv_audittimeline001"),
    version: "v1.0.0",
    target_ref: "cdr_candidate001",
    timeline_items: [
      createAuditTimelineItem({
        item_ref: "itm_001",
        timestamp: "2026-03-09T10:00:00.000Z",
        actor_ref: createActorRef("act_operator001"),
        action_type: TimelineActionType.CREATED,
        summary: "Candidate created",
        severity: SeverityLevel.LOW,
        linked_entity_refs: ["cdr_candidate001"],
      }),
    ],
    correlation_groups: [{ group_ref: "cgr_group001" as never, item_refs: ["itm_001"] }],
    filter_state: { actor_refs: [], action_types: [], severity_levels: [] },
    visibility_status: VisibilityStatus.VISIBLE,
  });

const makeReadiness = () =>
  createReadinessPanelView({
    id: createReadinessPanelViewId("rpv_readiness001"),
    version: "v1.0.0",
    target_ref: "cdr_candidate001",
    readiness_status: ReadinessStatus.NEEDS_REVIEW,
    gating_items: [createReadinessGatingItem({ key: "review_complete", satisfied: false, reason_nullable: "pending" })],
    blocking_issues: [],
    warnings: [createWarningMessage("missing_review")],
    recommended_next_actions: [
      createReadinessRecommendedAction({
        action_key: OperationsConsoleActionKey.REQUEST_REVISION,
        reason: "Ask for updates before publish",
      }),
    ],
  });

const makeActionSurface = () =>
  createActionSurface({
    id: createActionSurfaceId("asf_actionsurface001"),
    version: "v1.0.0",
    target_ref: "cdr_candidate001",
    available_action_keys: [OperationsConsoleActionKey.OPEN_DETAIL],
    hidden_action_keys: [OperationsConsoleActionKey.APPROVE],
    disabled_action_keys: [OperationsConsoleActionKey.PUBLISH],
    action_constraints: [
      createActionConstraint({
        constraint_ref: createActionConstraintRef("acr_constraint001"),
        description: "publish blocked until review",
        is_blocking: true,
      }),
    ],
    permission_basis: createPermissionBasis({
      roles: ["editor"],
      explicit_allow_actions: [OperationsConsoleActionKey.OPEN_DETAIL],
      explicit_deny_actions: [OperationsConsoleActionKey.PUBLISH],
      deny_first: true,
    }),
  });

const makePermissionAwareState = () =>
  createPermissionAwareViewState({
    id: createPermissionAwareViewStateId("pvs_permission001"),
    version: "v1.0.0",
    user_id: "usr_operator",
    workspace_id_nullable: "wsp_editorial",
    target_view_key: "candidate_detail",
    visibility_status: VisibilityStatus.VISIBLE,
    allowed_actions: [OperationsConsoleActionKey.OPEN_DETAIL],
    denied_actions: [OperationsConsoleActionKey.PUBLISH],
    evaluation_basis: createPermissionEvaluationBasis({
      source_module: "platform-access",
      evaluated_roles: ["editor"],
      matched_rules: ["policy_view"],
      deny_reasons: ["publish_not_granted"],
    }),
  });

const makeNavigationState = () =>
  createConsoleNavigationState({
    id: createConsoleNavigationStateId("cns_navigation001"),
    version: "v1.0.0",
    active_panel: PanelKey.CANDIDATE_DETAIL,
    active_filters: createConsoleFilterState({ filters: [] }),
    selected_entity_ref_nullable: "cdr_candidate001",
    breadcrumb_state: { items: [createBreadcrumbItem("candidate_detail"), createBreadcrumbItem("candidate")] },
    user_scope: ViewScope.WORKSPACE,
    persisted_state_policy: PersistedStatePolicy.SESSION,
  });

describe("operations-console module", () => {
  it("1) valid QueuePanelView", () => {
    const report = validateQueuePanelView(makeQueuePanel());
    expect(report.isValid).toBe(true);
    expect(new DeterministicQueueViewBuilder().buildQueueView({ view: makeQueuePanel() }).id).toBe(
      makeQueuePanel().id,
    );
  });

  it("2) invalid QueuePanelView without panel_key", () => {
    const invalid = { ...makeQueuePanel(), panel_key: undefined };
    expect(validateQueuePanelView(invalid as never).isValid).toBe(false);
  });

  it("3) invalid QueuePanelView with incoherent entries", () => {
    const invalid = { ...makeQueuePanel(), entries: [{ ...makeQueueEntry(), entry_type: EntryType.REVIEW }] };
    expect(validateQueuePanelView(invalid as never).isValid).toBe(false);
  });

  it("4) valid CandidateDetailView", () => {
    const report = validateCandidateDetailView(makeCandidateDetail());
    expect(report.isValid).toBe(true);
    expect(
      new DeterministicCandidateViewBuilder().buildCandidateDetailView({
        detail_view: makeCandidateDetail(),
        list_view: {
          id: "clv_candidatelist001" as never,
          version: "v1.0.0",
          view_scope: ViewScope.WORKSPACE,
          candidate_entries: [],
          aggregate_counts: {},
          applied_filters: [],
          sort_config: createQueueSortConfig({ sort_field: createSortField("created_at"), sort_direction: SortDirection.DESC }),
        },
      }).id,
    ).toBe(makeCandidateDetail().id);
  });

  it("5) invalid CandidateDetailView without valid target ref", () => {
    const invalid = { ...makeCandidateDetail(), candidate_ref: "invalid_ref" };
    expect(validateCandidateDetailView(invalid as never).isValid).toBe(false);
  });

  it("6) valid ArtifactInspectionView", () => {
    const report = validateArtifactInspectionView(makeArtifactInspection());
    expect(report.isValid).toBe(true);
    expect(new DeterministicArtifactInspectionBuilder().buildInspectionView({ view: makeArtifactInspection() }).id).toBe(
      makeArtifactInspection().id,
    );
  });

  it("7) invalid ArtifactInspectionView with mismatched artifact type", () => {
    const invalid = {
      ...makeArtifactInspection(),
      artifact_ref: createArtifactRef("arf_publication_item001"),
      artifact_type: ArtifactType.RELIABILITY_REPORT,
    };
    expect(validateArtifactInspectionView(invalid).isValid).toBe(false);
  });

  it("8) valid AuditTimelineView", () => {
    const report = validateAuditTimelineView(makeAuditTimeline());
    expect(report.isValid).toBe(true);
    expect(new DeterministicAuditTimelineBuilder().buildTimeline({ view: makeAuditTimeline() }).id).toBe(
      makeAuditTimeline().id,
    );
  });

  it("9) invalid AuditTimelineView with missing timestamps", () => {
    const invalid = {
      ...makeAuditTimeline(),
      timeline_items: [{ ...makeAuditTimeline().timeline_items[0], timestamp: "" }],
    };
    expect(validateAuditTimelineView(invalid as never).isValid).toBe(false);
  });

  it("10) valid ReadinessPanelView", () => {
    const report = validateReadinessPanelView(makeReadiness());
    expect(report.isValid).toBe(true);
    expect(new DeterministicReadinessPanelBuilder().buildReadinessPanel({ view: makeReadiness() }).id).toBe(
      makeReadiness().id,
    );
  });

  it("11) invalid ReadinessPanelView marked ready with blocking issues", () => {
    const invalid = {
      ...makeReadiness(),
      readiness_status: ReadinessStatus.READY,
      blocking_issues: ["blocking"],
      gating_items: [createReadinessGatingItem({ key: "x", satisfied: true, reason_nullable: null })],
    };
    expect(validateReadinessPanelView(invalid as never).isValid).toBe(false);
  });

  it("12) valid ActionSurface", () => {
    const report = validateActionSurface(makeActionSurface());
    expect(report.isValid).toBe(true);
    expect(new DeterministicActionSurfaceResolver().resolve({ surface: makeActionSurface() }).id).toBe(
      makeActionSurface().id,
    );
  });

  it("13) invalid ActionSurface exposing denied action", () => {
    const invalid = {
      ...makeActionSurface(),
      available_action_keys: [OperationsConsoleActionKey.PUBLISH],
    };
    expect(validateActionSurface(invalid as never).isValid).toBe(false);
  });

  it("14) invalid ActionSurface with overlapping action buckets", () => {
    const invalid = {
      ...makeActionSurface(),
      available_action_keys: [OperationsConsoleActionKey.OPEN_DETAIL],
      hidden_action_keys: [OperationsConsoleActionKey.OPEN_DETAIL],
    };
    expect(validateActionSurface(invalid as never).isValid).toBe(false);
  });

  it("15) valid PermissionAwareViewState", () => {
    const report = validatePermissionAwareViewState(makePermissionAwareState());
    expect(report.isValid).toBe(true);
    expect(new DeterministicPermissionAwareViewEvaluator().evaluate({ state: makePermissionAwareState() }).id).toBe(
      makePermissionAwareState().id,
    );
  });

  it("16) invalid hidden PermissionAwareViewState with allowed actions", () => {
    const invalid = {
      ...makePermissionAwareState(),
      visibility_status: VisibilityStatus.HIDDEN,
      allowed_actions: [OperationsConsoleActionKey.OPEN_DETAIL],
    };
    expect(validatePermissionAwareViewState(invalid as never).isValid).toBe(false);
  });

  it("17) valid ConsoleNavigationState", () => {
    const report = validateConsoleNavigationState(makeNavigationState());
    expect(report.isValid).toBe(true);
    expect(new DeterministicConsoleStateResolver().resolve({ state: makeNavigationState() }).id).toBe(
      makeNavigationState().id,
    );
  });

  it("18) invalid ConsoleNavigationState with inconsistent breadcrumb/panel state", () => {
    const invalid = {
      ...makeNavigationState(),
      breadcrumb_state: { items: [createBreadcrumbItem("queue")] },
    };
    expect(validateConsoleNavigationState(invalid as never).isValid).toBe(false);
  });

  it("19) compatibility test with Platform Access artifacts", () => {
    const result = new PlatformAccessConsoleCompatibilityAdapter().adapt({
      source_module: "platform-access",
      visibility: "partial",
      allowed_actions: ["open_detail", "publish"],
      denied_actions: ["publish"],
    });
    expect(
      validateOperationsConsoleCompatibility(result, undefined, {
        source_visibility: "partial",
        source_allowed_actions: ["open_detail", "publish"],
        source_denied_actions: ["publish"],
      }).isValid,
    ).toBe(true);
    expect(result.propagated_allowed_actions).toEqual(["open_detail"]);
  });

  it("20) compatibility test with Editorial artifacts", () => {
    const result = new EditorialConsoleCompatibilityAdapter().adapt({
      source_module: "editorial",
      visibility: "visible",
      allowed_actions: ["open_detail", "approve"],
      denied_actions: [],
    });
    expect(validateOperationsConsoleCompatibility(result).isValid).toBe(true);
  });

  it("21) compatibility test with Publication artifacts", () => {
    const result = new PublicationConsoleCompatibilityAdapter().adapt({
      source_module: "live-integration",
      visibility: "visible",
      allowed_actions: ["prepare_publication"],
      denied_actions: [],
    });
    expect(validateOperationsConsoleCompatibility(result).isValid).toBe(true);
  });

  it("22) compatibility test with Reliability artifacts", () => {
    const result = new ReliabilityConsoleCompatibilityAdapter().adapt({
      source_module: "reliability",
      visibility: "partial",
      allowed_actions: ["acknowledge_warning"],
      denied_actions: [],
    });
    expect(validateOperationsConsoleCompatibility(result).isValid).toBe(true);
  });

  it("23) composite compatibility test with conservative permission propagation", () => {
    const composite = new CompositeOperationsConsoleCompatibilityAdapter().adapt({
      source_module: "composite",
      results: [
        {
          id: createOperationsConsoleCompatibilityResultId("occ_composebase001"),
          source_module: "a",
          target_contract: "x",
          compatible: true,
          propagated_visibility: "visible",
          propagated_allowed_actions: ["open_detail", "publish"],
          propagated_denied_actions: [],
          lossy_fields: [],
          notes: [],
        },
        {
          id: createOperationsConsoleCompatibilityResultId("occ_composebase002"),
          source_module: "b",
          target_contract: "x",
          compatible: true,
          propagated_visibility: "partial",
          propagated_allowed_actions: ["open_detail"],
          propagated_denied_actions: ["publish"],
          lossy_fields: [],
          notes: [],
        },
      ],
    });
    expect(composite.propagated_visibility).toBe("partial");
    expect(composite.propagated_allowed_actions).toEqual(["open_detail"]);
    expect(composite.propagated_denied_actions).toContain("publish");
  });

  it("registers all operations-console schemas in AJV", () => {
    const schemaIds = [
      SHARED_CONSOLE_SCHEMA_ID,
      QUEUE_PANEL_VIEW_SCHEMA_ID,
      QUEUE_ENTRY_VIEW_SCHEMA_ID,
      CANDIDATE_LIST_VIEW_SCHEMA_ID,
      CANDIDATE_DETAIL_VIEW_SCHEMA_ID,
      ARTIFACT_INSPECTION_VIEW_SCHEMA_ID,
      AUDIT_TIMELINE_ITEM_SCHEMA_ID,
      AUDIT_TIMELINE_VIEW_SCHEMA_ID,
      READINESS_PANEL_VIEW_SCHEMA_ID,
      ACTION_SURFACE_SCHEMA_ID,
      CONSOLE_NAVIGATION_STATE_SCHEMA_ID,
      PERMISSION_AWARE_VIEW_STATE_SCHEMA_ID,
    ];
    for (const schemaId of schemaIds) {
      expect(() => requireSchemaValidator(schemaId)).not.toThrow();
    }
    expect(queuePanelViewSchema.$id).toBe(QUEUE_PANEL_VIEW_SCHEMA_ID);
    expect(queueEntryViewSchema.$id).toBe(QUEUE_ENTRY_VIEW_SCHEMA_ID);
    expect(candidateListViewSchema.$id).toBe(CANDIDATE_LIST_VIEW_SCHEMA_ID);
    expect(candidateDetailViewSchema.$id).toBe(CANDIDATE_DETAIL_VIEW_SCHEMA_ID);
    expect(artifactInspectionViewSchema.$id).toBe(ARTIFACT_INSPECTION_VIEW_SCHEMA_ID);
    expect(auditTimelineItemSchema.$id).toBe(AUDIT_TIMELINE_ITEM_SCHEMA_ID);
    expect(auditTimelineViewSchema.$id).toBe(AUDIT_TIMELINE_VIEW_SCHEMA_ID);
    expect(readinessPanelViewSchema.$id).toBe(READINESS_PANEL_VIEW_SCHEMA_ID);
    expect(actionSurfaceSchema.$id).toBe(ACTION_SURFACE_SCHEMA_ID);
    expect(consoleNavigationStateSchema.$id).toBe(CONSOLE_NAVIGATION_STATE_SCHEMA_ID);
    expect(permissionAwareViewStateSchema.$id).toBe(PERMISSION_AWARE_VIEW_STATE_SCHEMA_ID);
  });
});
