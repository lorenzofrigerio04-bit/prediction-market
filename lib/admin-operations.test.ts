import { describe, expect, it } from "vitest";
import {
  buildOperationsDetailViewModel,
  buildOperationsPermissionSurface,
  mapOperationsListItem,
  type OperationsSubmissionRecord,
} from "./admin-operations";

const baseSubmission: OperationsSubmissionRecord = {
  id: "sub-1",
  title: "Il Milan vincerà il campionato?",
  description: "Scenario finale di stagione",
  category: "Sport",
  closesAt: "2026-06-01T12:00:00.000Z",
  resolutionSource: "https://example.com/milan",
  status: "PENDING",
  reviewNotes: "MDE_SHADOW_TITLE_TOO_SHORT | Categoria non valida",
  eventId: null,
  notifyPhone: null,
  createdAt: "2026-05-01T10:00:00.000Z",
  updatedAt: "2026-05-01T10:05:00.000Z",
  reviewedAt: null,
  reviewedById: null,
  submittedById: "user-1",
  submittedBy: {
    id: "user-1",
    name: "Alice",
    email: "alice@example.com",
  },
  event: null,
  submitterCredits: {
    credits: 200,
    creditsMicros: 9_500_000n,
  },
};

describe("admin operations permission surfaces", () => {
  it("keeps deny-first buckets consistent and disables unavailable artifacts", () => {
    const surface = buildOperationsPermissionSurface({
      role: "ADMIN",
      hasSubmission: true,
      hasEvent: false,
      hasAuditItems: false,
      hasCredits: false,
    });

    expect(surface.evaluationBasis.denyFirst).toBe(true);
    expect(surface.actionSurface.denyFirst).toBe(true);
    expect(surface.actionSurface.availableActionKeys).toEqual(
      expect.arrayContaining(["submit", "run_pipeline", "open_detail"])
    );
    expect(surface.actionSurface.disabledActionKeys).toEqual(
      expect.arrayContaining(["open_event", "view_audit", "view_credits"])
    );
    expect(surface.deniedActions).toEqual([]);
  });

  it("maps list items with normalized review notes and bridged pipeline state", () => {
    const item = mapOperationsListItem(baseSubmission, "ADMIN");

    expect(item.reviewNotes).toEqual([
      "MDE_SHADOW_TITLE_TOO_SHORT",
      "Categoria non valida",
    ]);
    expect(item.pipelineState.label).toBe("Validation held in review");
    expect(item.actionSurface.availableActionKeys).toContain("open_detail");
  });
});

describe("admin operations detail view model", () => {
  it("builds conservative readiness and credits summaries without inventing engine logic", () => {
    const detail = buildOperationsDetailViewModel({
      role: "ADMIN",
      submission: baseSubmission,
      auditItems: [],
      latestPipelineRun: {
        runId: "run-1",
        startedAt: "2026-05-01T09:00:00.000Z",
        completedAt: "2026-05-01T09:10:00.000Z",
        source: "trend",
        eligibleCount: 8,
        candidatesCount: 5,
        rulebookValidCount: 4,
        rulebookRejectedCount: 1,
        selectedCount: 2,
        createdCount: 1,
        skippedCount: 1,
        errorMessage: null,
      },
      gates: {
        mdeEnforceValidation: true,
        enableLegacyPipelineV2: false,
      },
    });

    expect(detail.pipelineSummary.validationMode).toBe("enforce");
    expect(detail.pipelineSummary.state).toBe("pending_review");
    expect(detail.readinessSummary.readinessStatus).toBe("needs_review");
    expect(detail.readinessSummary.warnings).toContain("MDE_SHADOW_TITLE_TOO_SHORT");
    expect(detail.auditSummary.visibilityStatus).toBe("partial");
    expect(detail.creditsSummary?.displayCredits).toBe(9);
    expect(detail.reviewQueueEntry.status).toBe("PENDING");
  });

  it("sets publicationPath to mde_authoritative and label when event has creationMetadata.created_by_pipeline event-gen-v2", () => {
    const submissionWithMdeEvent: OperationsSubmissionRecord = {
      ...baseSubmission,
      status: "APPROVED",
      eventId: "evt-mde-1",
      reviewNotes: null,
      event: {
        id: "evt-mde-1",
        title: "MDE published event?",
        category: "Sport",
        status: "OPEN",
        resolutionStatus: "PENDING",
        closesAtIso: "2026-06-01T12:00:00.000Z",
        createdAtIso: "2026-05-01T10:00:00.000Z",
        updatedAtIso: "2026-05-01T10:05:00.000Z",
        resolved: false,
        outcome: null,
        marketId: "MKT-001",
        tradingMode: "AMM",
        totalCredits: 0,
        resolutionSourceUrl: "https://example.com/source",
        creationMetadata: {
          created_by_pipeline: "event-gen-v2",
          pipeline_version: "2.0",
        },
      },
    };

    const detail = buildOperationsDetailViewModel({
      role: "ADMIN",
      submission: submissionWithMdeEvent,
      auditItems: [],
      latestPipelineRun: null,
      gates: { mdeEnforceValidation: false, enableLegacyPipelineV2: false },
    });

    expect(detail.pipelineSummary.publicationPath).toBe("mde_authoritative");
    expect(detail.pipelineSummary.label).toBe("Published via Market Design Engine (MDE)");
    expect(detail.pipelineSummary.detail).toContain("MDE authoritative");
    expect(detail.pipelineSummary.state).toBe("published");
  });

  it("sets publicationPath to legacy_bridge and label when event has no creationMetadata pipeline", () => {
    const submissionWithLegacyEvent: OperationsSubmissionRecord = {
      ...baseSubmission,
      status: "APPROVED",
      eventId: "evt-legacy-1",
      reviewNotes: null,
      event: {
        id: "evt-legacy-1",
        title: "Legacy published event?",
        category: "Sport",
        status: "OPEN",
        resolutionStatus: "PENDING",
        closesAtIso: "2026-06-01T12:00:00.000Z",
        createdAtIso: "2026-05-01T10:00:00.000Z",
        updatedAtIso: "2026-05-01T10:05:00.000Z",
        resolved: false,
        outcome: null,
        marketId: null,
        tradingMode: "AMM",
        totalCredits: 0,
        resolutionSourceUrl: null,
        creationMetadata: null,
      },
    };

    const detail = buildOperationsDetailViewModel({
      role: "ADMIN",
      submission: submissionWithLegacyEvent,
      auditItems: [],
      latestPipelineRun: null,
      gates: { mdeEnforceValidation: false, enableLegacyPipelineV2: false },
    });

    expect(detail.pipelineSummary.publicationPath).toBe("legacy_bridge");
    expect(detail.pipelineSummary.label).toBe("Submission bridged and published (legacy)");
    expect(detail.pipelineSummary.detail).toContain("legacy platform");
    expect(detail.pipelineSummary.state).toBe("published");
  });

  it("leaves publicationPath undefined when submission has no event", () => {
    const detail = buildOperationsDetailViewModel({
      role: "ADMIN",
      submission: baseSubmission,
      auditItems: [],
      latestPipelineRun: null,
      gates: { mdeEnforceValidation: false, enableLegacyPipelineV2: false },
    });

    expect(detail.pipelineSummary.publicationPath).toBeUndefined();
    expect(detail.pipelineSummary.label).toBe("Submission held in review");
  });
});
