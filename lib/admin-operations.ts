import { evaluateAdminCapability } from "@/lib/integration/adapters/admin-capability-adapter";
import { toCreditsReadModel } from "@/lib/integration/adapters/credits-read-model-adapter";
import { toReviewQueueViewModel } from "@/lib/integration/adapters/review-queue-view-model-adapter";

export type OperationsVisibilityStatus = "visible" | "partial" | "hidden";

export type OperationsActionKey =
  | "submit"
  | "open_detail"
  | "open_event"
  | "view_audit"
  | "view_credits"
  | "run_pipeline";

export interface OperationsActionConstraint {
  actionKey: OperationsActionKey;
  description: string;
  isBlocking: boolean;
}

export interface OperationsPermissionSurface {
  visibilityStatus: OperationsVisibilityStatus;
  allowedActions: OperationsActionKey[];
  deniedActions: OperationsActionKey[];
  evaluationBasis: {
    sourceModule: "admin-capability-adapter";
    evaluatedRole: string | null;
    matchedRules: string[];
    denyReasons: string[];
    denyFirst: true;
  };
  actionSurface: {
    availableActionKeys: OperationsActionKey[];
    hiddenActionKeys: OperationsActionKey[];
    disabledActionKeys: OperationsActionKey[];
    actionConstraints: OperationsActionConstraint[];
    denyFirst: true;
  };
}

export interface OperationsUserSummary {
  id: string;
  name: string | null;
  email: string | null;
}

export interface OperationsEventSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  resolutionStatus: string;
  closesAtIso: string;
  createdAtIso: string;
  updatedAtIso: string;
  resolved: boolean;
  outcome: string | null;
  marketId: string | null;
  tradingMode: string | null;
  totalCredits: number | null;
  resolutionSourceUrl: string | null;
  /** Set when event was created by event-gen-v2 (MDE authoritative path) */
  creationMetadata?: Record<string, unknown> | null;
}

export interface OperationsSubmissionRecord {
  id: string;
  title: string;
  description: string | null;
  category: string;
  closesAt: Date | string;
  resolutionSource: string | null;
  status: string;
  reviewNotes: string | null;
  eventId: string | null;
  notifyPhone: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  reviewedAt: Date | string | null;
  reviewedById: string | null;
  submittedById: string;
  submittedBy: OperationsUserSummary | null;
  event: OperationsEventSummary | null;
  submitterCredits:
    | {
        credits: number;
        creditsMicros: bigint | null;
      }
    | null;
}

export interface OperationsPipelineRunRecord {
  runId: string;
  startedAt: Date | string;
  completedAt: Date | string | null;
  source: string;
  eligibleCount: number;
  candidatesCount: number;
  rulebookValidCount: number;
  rulebookRejectedCount: number;
  selectedCount: number;
  createdCount: number;
  skippedCount: number;
  errorMessage: string | null;
}

export interface OperationsListItem {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAtIso: string;
  closesAtIso: string;
  eventId: string | null;
  reviewNotes: string[];
  submissionResult: {
    label: string;
    tone: "success" | "warning" | "danger";
  };
  pipelineState: {
    label: string;
    tone: "success" | "warning" | "danger";
  };
  actionSurface: OperationsPermissionSurface["actionSurface"];
}

export interface OperationsDashboardViewModel {
  gates: {
    mdeEnforceValidation: boolean;
    enableLegacyPipelineV2: boolean;
  };
  pipelineSnapshot: {
    runId: string;
    startedAtIso: string;
    completedAtIso: string | null;
    source: string;
    candidatesCount: number;
    rulebookValidCount: number;
    createdCount: number;
    skippedCount: number;
    status: "success" | "warning" | "danger";
    errorMessage: string | null;
  } | null;
  permissions: OperationsPermissionSurface;
  submissions: OperationsListItem[];
}

export interface OperationsDetailViewModel {
  gates: OperationsDashboardViewModel["gates"];
  permissions: OperationsPermissionSurface;
  submission: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    closesAtIso: string;
    createdAtIso: string;
    updatedAtIso: string;
    reviewNotes: string[];
    resolutionSource: string | null;
    notifyPhone: string | null;
    status: string;
    eventId: string | null;
    submittedBy: OperationsUserSummary | null;
  };
  reviewQueueEntry: ReturnType<typeof toReviewQueueViewModel>;
  pipelineSummary: {
    state: "published" | "pending_review" | "rejected";
    label: string;
    detail: string;
    validationMode: "enforce" | "shadow";
    legacyPipelineMode: "legacy_v2" | "event_gen_v2";
    latestRun: OperationsDashboardViewModel["pipelineSnapshot"];
    /** Actual path used to publish this submission (when event exists) */
    publicationPath?: "mde_authoritative" | "legacy_bridge";
  };
  candidateInspection: {
    candidateRef: string;
    visibilityStatus: OperationsVisibilityStatus;
    artifactSections: Array<{
      key: string;
      title: string;
      items: Array<{ label: string; value: string }>;
    }>;
    flags: string[];
  };
  readinessSummary: {
    readinessStatus: "ready" | "needs_review" | "blocked";
    gatingItems: Array<{
      key: string;
      satisfied: boolean;
      reason: string | null;
    }>;
    blockingIssues: string[];
    warnings: string[];
    recommendedNextActions: Array<{
      actionKey: OperationsActionKey;
      reason: string;
    }>;
  };
  publicationSummary: {
    state: "published" | "pending_review" | "rejected";
    event: OperationsEventSummary | null;
    blockers: string[];
    warnings: string[];
  };
  auditSummary: {
    visibilityStatus: OperationsVisibilityStatus;
    items: Array<{
      id: string;
      createdAtIso: string;
      actorLabel: string;
      action: string;
      summary: string;
    }>;
  };
  creditsSummary:
    | {
        visibilityStatus: OperationsVisibilityStatus;
        ownerLabel: string;
        displayCredits: number;
        microsBalance: string | null;
      }
    | null;
}

export interface AuditSummaryRecord {
  id: string;
  createdAt: Date | string;
  action: string;
  entityType: string;
  entityId: string | null;
  user: OperationsUserSummary | null;
}

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function splitReviewNotes(reviewNotes: string | null): string[] {
  if (!reviewNotes) return [];
  return reviewNotes
    .split("|")
    .map((note) => note.trim())
    .filter(Boolean);
}

function deriveSubmissionState(record: OperationsSubmissionRecord): {
  label: string;
  tone: "success" | "warning" | "danger";
} {
  if (record.eventId || record.status === "APPROVED") {
    return { label: "Published to event", tone: "success" };
  }
  if (record.status === "REJECTED") {
    return { label: "Rejected", tone: "danger" };
  }
  return { label: "Pending review", tone: "warning" };
}

function derivePipelineState(record: OperationsSubmissionRecord): {
  label: string;
  tone: "success" | "warning" | "danger";
} {
  if (record.eventId) {
    return { label: "Bridge completed", tone: "success" };
  }
  if (splitReviewNotes(record.reviewNotes).some((note) => note.includes("MDE_"))) {
    return { label: "Validation held in review", tone: "warning" };
  }
  if (record.status === "REJECTED") {
    return { label: "Stopped", tone: "danger" };
  }
  return { label: "Awaiting review", tone: "warning" };
}

export function buildOperationsPermissionSurface(input: {
  role: string | null;
  hasSubmission?: boolean;
  hasEvent?: boolean;
  hasAuditItems?: boolean;
  hasCredits?: boolean;
}): OperationsPermissionSurface {
  const capabilityChecks = {
    submit: evaluateAdminCapability("events:create", { role: input.role }),
    open_detail: evaluateAdminCapability("events:create", { role: input.role }),
    open_event: evaluateAdminCapability("events:create", { role: input.role }),
    view_audit: evaluateAdminCapability("audit:read", { role: input.role }),
    view_credits: evaluateAdminCapability("users:read", { role: input.role }),
    run_pipeline: evaluateAdminCapability("pipeline:run", { role: input.role }),
  } as const;

  const availableActionKeys: OperationsActionKey[] = [];
  const hiddenActionKeys: OperationsActionKey[] = [];
  const disabledActionKeys: OperationsActionKey[] = [];
  const actionConstraints: OperationsActionConstraint[] = [];
  const allowedActions: OperationsActionKey[] = [];
  const deniedActions: OperationsActionKey[] = [];
  const denyReasons = new Set<string>();

  const registerAllowed = (
    key: OperationsActionKey,
    opts?: { hideWhenMissing?: boolean; present?: boolean; disableReason?: string }
  ) => {
    const decision = capabilityChecks[key];
    if (!decision.allowed) {
      deniedActions.push(key);
      hiddenActionKeys.push(key);
      if (decision.reason) denyReasons.add(decision.reason);
      return;
    }

    allowedActions.push(key);
    const present = opts?.present ?? true;
    if (!present) {
      if (opts?.hideWhenMissing) {
        hiddenActionKeys.push(key);
        return;
      }
      disabledActionKeys.push(key);
      if (opts?.disableReason) {
        actionConstraints.push({
          actionKey: key,
          description: opts.disableReason,
          isBlocking: true,
        });
      }
      return;
    }

    availableActionKeys.push(key);
  };

  registerAllowed("submit");
  registerAllowed("run_pipeline");
  registerAllowed("open_detail", { present: input.hasSubmission ?? false, hideWhenMissing: true });
  registerAllowed("open_event", {
    present: input.hasEvent ?? false,
    disableReason: "The submission does not expose a published event yet.",
  });
  registerAllowed("view_audit", {
    present: input.hasAuditItems ?? false,
    disableReason: "No audit summary is available for this submission yet.",
  });
  registerAllowed("view_credits", {
    present: input.hasCredits ?? false,
    disableReason: "Credits visibility is not available for this submission.",
  });

  const unique = <T extends string>(values: T[]) => [...new Set(values)];
  const normalizedDenied = unique(deniedActions);
  const deniedSet = new Set(normalizedDenied);
  const normalizedAllowed = unique(allowedActions).filter((action) => !deniedSet.has(action));
  const normalizedAvailable = unique(availableActionKeys).filter((action) => !deniedSet.has(action));
  const normalizedHidden = unique(hiddenActionKeys).filter((action) => !normalizedAvailable.includes(action));
  const normalizedDisabled = unique(disabledActionKeys).filter(
    (action) => !normalizedAvailable.includes(action) && !normalizedHidden.includes(action)
  );

  let visibilityStatus: OperationsVisibilityStatus = "hidden";
  if (normalizedAvailable.length > 0) {
    visibilityStatus = normalizedDenied.length > 0 || normalizedDisabled.length > 0 ? "partial" : "visible";
  } else if (normalizedAllowed.length > 0) {
    visibilityStatus = "partial";
  }

  return {
    visibilityStatus,
    allowedActions: normalizedAllowed,
    deniedActions: normalizedDenied,
    evaluationBasis: {
      sourceModule: "admin-capability-adapter",
      evaluatedRole: input.role,
      matchedRules: normalizedAllowed.length > 0 ? ["admin-capability-allow"] : [],
      denyReasons: [...denyReasons],
      denyFirst: true,
    },
    actionSurface: {
      availableActionKeys: normalizedAvailable,
      hiddenActionKeys: normalizedHidden,
      disabledActionKeys: normalizedDisabled,
      actionConstraints,
      denyFirst: true,
    },
  };
}

export function mapOperationsListItem(
  submission: OperationsSubmissionRecord,
  role: string | null
): OperationsListItem {
  const reviewNotes = splitReviewNotes(submission.reviewNotes);
  const permissionSurface = buildOperationsPermissionSurface({
    role,
    hasSubmission: true,
    hasEvent: Boolean(submission.eventId),
    hasAuditItems: Boolean(submission.eventId),
    hasCredits: Boolean(submission.submitterCredits),
  });

  return {
    id: submission.id,
    title: submission.title,
    category: submission.category,
    status: submission.status,
    createdAtIso: toIso(submission.createdAt) ?? new Date(0).toISOString(),
    closesAtIso: toIso(submission.closesAt) ?? new Date(0).toISOString(),
    eventId: submission.eventId,
    reviewNotes,
    submissionResult: deriveSubmissionState(submission),
    pipelineState: derivePipelineState(submission),
    actionSurface: permissionSurface.actionSurface,
  };
}

function mapPipelineSnapshot(
  run: OperationsPipelineRunRecord | null
): OperationsDashboardViewModel["pipelineSnapshot"] {
  if (!run) return null;

  return {
    runId: run.runId,
    startedAtIso: toIso(run.startedAt) ?? new Date(0).toISOString(),
    completedAtIso: toIso(run.completedAt),
    source: run.source,
    candidatesCount: run.candidatesCount,
    rulebookValidCount: run.rulebookValidCount,
    createdCount: run.createdCount,
    skippedCount: run.skippedCount,
    status: run.errorMessage ? "danger" : run.createdCount > 0 ? "success" : "warning",
    errorMessage: run.errorMessage,
  };
}

export function buildOperationsDashboardViewModel(input: {
  role: string | null;
  submissions: OperationsSubmissionRecord[];
  latestPipelineRun: OperationsPipelineRunRecord | null;
  gates: OperationsDashboardViewModel["gates"];
}): OperationsDashboardViewModel {
  return {
    gates: input.gates,
    pipelineSnapshot: mapPipelineSnapshot(input.latestPipelineRun),
    permissions: buildOperationsPermissionSurface({
      role: input.role,
      hasSubmission: input.submissions.length > 0,
      hasAuditItems: input.submissions.some((submission) => Boolean(submission.eventId)),
      hasCredits: input.submissions.some((submission) => Boolean(submission.submitterCredits)),
    }),
    submissions: input.submissions.map((submission) => mapOperationsListItem(submission, input.role)),
  };
}

export function buildOperationsDetailViewModel(input: {
  role: string | null;
  submission: OperationsSubmissionRecord;
  auditItems: AuditSummaryRecord[];
  latestPipelineRun: OperationsPipelineRunRecord | null;
  gates: OperationsDashboardViewModel["gates"];
}): OperationsDetailViewModel {
  const reviewNotes = splitReviewNotes(input.submission.reviewNotes);
  const permissionSurface = buildOperationsPermissionSurface({
    role: input.role,
    hasSubmission: true,
    hasEvent: Boolean(input.submission.eventId),
    hasAuditItems: input.auditItems.length > 0,
    hasCredits: Boolean(input.submission.submitterCredits),
  });
  const reviewQueueEntry = toReviewQueueViewModel({
    id: input.submission.id,
    title: input.submission.title,
    description: input.submission.description,
    category: input.submission.category,
    closesAt: input.submission.closesAt,
    status: input.submission.status,
    reviewNotes: input.submission.reviewNotes,
    createdAt: input.submission.createdAt,
  });

  const readinessStatus =
    input.submission.eventId || input.submission.status === "APPROVED"
      ? "ready"
      : input.submission.status === "REJECTED"
        ? "blocked"
        : "needs_review";

  const blockingIssues =
    input.submission.status === "REJECTED"
      ? reviewNotes.length > 0
        ? reviewNotes
        : ["Submission rejected by governance or review gates."]
      : [];
  const warnings =
    input.submission.status === "PENDING"
      ? reviewNotes.length > 0
        ? reviewNotes
        : ["Submission is waiting for operator review."]
      : [];

  const candidateFlags = [
    input.submission.status,
    input.submission.event?.status,
    input.submission.event?.resolutionStatus,
  ].filter((value): value is string => Boolean(value));

  const creationMeta = input.submission.event?.creationMetadata as
    | { created_by_pipeline?: string }
    | undefined
    | null;
  const publicationPath: "mde_authoritative" | "legacy_bridge" | undefined =
    input.submission.eventId != null
      ? creationMeta?.created_by_pipeline === "event-gen-v2"
        ? "mde_authoritative"
        : "legacy_bridge"
      : undefined;

  const publishedLabel =
    publicationPath === "mde_authoritative"
      ? "Published via Market Design Engine (MDE)"
      : "Submission bridged and published (legacy)";
  const publishedDetail =
    publicationPath === "mde_authoritative"
      ? "The event was created via the MDE authoritative path (event-gen-v2)."
      : "The bridged flow created a publishable event on the legacy platform.";

  return {
    gates: input.gates,
    permissions: permissionSurface,
    submission: {
      id: input.submission.id,
      title: input.submission.title,
      description: input.submission.description,
      category: input.submission.category,
      closesAtIso: toIso(input.submission.closesAt) ?? new Date(0).toISOString(),
      createdAtIso: toIso(input.submission.createdAt) ?? new Date(0).toISOString(),
      updatedAtIso: toIso(input.submission.updatedAt) ?? new Date(0).toISOString(),
      reviewNotes,
      resolutionSource: input.submission.resolutionSource,
      notifyPhone: input.submission.notifyPhone,
      status: input.submission.status,
      eventId: input.submission.eventId,
      submittedBy: input.submission.submittedBy,
    },
    reviewQueueEntry,
    pipelineSummary: {
      state: input.submission.eventId
        ? "published"
        : input.submission.status === "REJECTED"
          ? "rejected"
          : "pending_review",
      label: input.submission.eventId
        ? publishedLabel
        : input.submission.status === "REJECTED"
          ? "Submission stopped before publish"
          : "Submission held in review",
      detail: input.submission.eventId
        ? publishedDetail
        : input.submission.status === "REJECTED"
          ? "The submission is not publishable in the current state."
          : "The bridged flow preserved the submission for manual review.",
      validationMode: input.gates.mdeEnforceValidation ? "enforce" : "shadow",
      legacyPipelineMode: input.gates.enableLegacyPipelineV2 ? "legacy_v2" : "event_gen_v2",
      latestRun: mapPipelineSnapshot(input.latestPipelineRun),
      publicationPath,
    },
    candidateInspection: {
      candidateRef: `submission:${input.submission.id}`,
      visibilityStatus: permissionSurface.visibilityStatus,
      artifactSections: [
        {
          key: "candidate",
          title: "Candidate summary",
          items: [
            { label: "Title", value: input.submission.title },
            { label: "Category", value: input.submission.category },
            { label: "Closes at", value: toIso(input.submission.closesAt) ?? "Unknown" },
            { label: "Resolution source", value: input.submission.resolutionSource ?? "Not provided" },
          ],
        },
        {
          key: "provenance",
          title: "Provenance",
          items: [
            {
              label: "Submitted by",
              value:
                input.submission.submittedBy?.name ??
                input.submission.submittedBy?.email ??
                input.submission.submittedById,
            },
            { label: "Created at", value: toIso(input.submission.createdAt) ?? "Unknown" },
            { label: "Notify phone", value: input.submission.notifyPhone ?? "Not provided" },
          ],
        },
        ...(input.submission.event
          ? [
              {
                key: "event",
                title: "Market artifact",
                items: [
                  { label: "Event ID", value: input.submission.event.id },
                  { label: "Status", value: input.submission.event.status },
                  { label: "Resolution status", value: input.submission.event.resolutionStatus },
                  { label: "Trading mode", value: input.submission.event.tradingMode ?? "Unknown" },
                  { label: "Market ID", value: input.submission.event.marketId ?? "Not assigned" },
                ],
              },
            ]
          : []),
      ],
      flags: candidateFlags,
    },
    readinessSummary: {
      readinessStatus,
      gatingItems: [
        {
          key: "submission_recorded",
          satisfied: true,
          reason: null,
        },
        {
          key: "published_event_available",
          satisfied: Boolean(input.submission.eventId),
          reason: input.submission.eventId ? null : "No published event is linked yet.",
        },
        {
          key: "review_notes_clear",
          satisfied: reviewNotes.length === 0,
          reason: reviewNotes.length > 0 ? reviewNotes.join(" | ") : null,
        },
      ],
      blockingIssues,
      warnings,
      recommendedNextActions: input.submission.eventId
        ? [{ actionKey: "open_event", reason: "Inspect the published event in the legacy console." }]
        : [{ actionKey: "open_detail", reason: "Review the submission details and keep the bridge outcome under inspection." }],
    },
    publicationSummary: {
      state: input.submission.eventId
        ? "published"
        : input.submission.status === "REJECTED"
          ? "rejected"
          : "pending_review",
      event: input.submission.event,
      blockers: blockingIssues,
      warnings,
    },
    auditSummary: {
      visibilityStatus:
        permissionSurface.actionSurface.hiddenActionKeys.includes("view_audit") &&
        input.auditItems.length === 0
          ? "hidden"
          : input.auditItems.length > 0
            ? "visible"
            : "partial",
      items: input.auditItems.map((item) => ({
        id: item.id,
        createdAtIso: toIso(item.createdAt) ?? new Date(0).toISOString(),
        actorLabel: item.user?.name ?? item.user?.email ?? "System",
        action: item.action,
        summary: `${item.action} on ${item.entityType}${item.entityId ? ` ${item.entityId}` : ""}`,
      })),
    },
    creditsSummary: input.submission.submitterCredits
      ? {
          visibilityStatus: permissionSurface.actionSurface.hiddenActionKeys.includes("view_credits")
            ? "hidden"
            : "visible",
          ownerLabel:
            input.submission.submittedBy?.name ??
            input.submission.submittedBy?.email ??
            input.submission.submittedById,
          ...toCreditsReadModel(input.submission.submitterCredits),
        }
      : null,
  };
}
