import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetServerSession = vi.fn();
const mockRequireAdminCapability = vi.fn();
const mockEventSubmissionFindMany = vi.fn();
const mockEventSubmissionFindUnique = vi.fn();
const mockUserFindUnique = vi.fn();
const mockUserFindMany = vi.fn();
const mockEventFindMany = vi.fn();
const mockEventFindUnique = vi.fn();
const mockPipelineRunFindFirst = vi.fn();
const mockAuditLogFindMany = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: () => mockGetServerSession(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/admin", () => ({
  requireAdminCapability: (...args: unknown[]) => mockRequireAdminCapability(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    eventSubmission: {
      findMany: (...args: unknown[]) => mockEventSubmissionFindMany(...args),
      findUnique: (...args: unknown[]) => mockEventSubmissionFindUnique(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
    },
    event: {
      findMany: (...args: unknown[]) => mockEventFindMany(...args),
      findUnique: (...args: unknown[]) => mockEventFindUnique(...args),
    },
    pipelineRun: {
      findFirst: (...args: unknown[]) => mockPipelineRunFindFirst(...args),
    },
    auditLog: {
      findMany: (...args: unknown[]) => mockAuditLogFindMany(...args),
    },
  },
}));

describe("admin operations routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });
    mockRequireAdminCapability.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPipelineRunFindFirst.mockResolvedValue({
      runId: "run-1",
      startedAt: new Date("2026-05-01T09:00:00.000Z"),
      completedAt: new Date("2026-05-01T09:10:00.000Z"),
      source: "trend",
      eligibleCount: 5,
      candidatesCount: 4,
      rulebookValidCount: 3,
      rulebookRejectedCount: 1,
      selectedCount: 2,
      createdCount: 1,
      skippedCount: 1,
      errorMessage: null,
    });
  });

  it("denies the dashboard read model when events:create is missing", async () => {
    mockRequireAdminCapability.mockRejectedValue(
      new Error("Accesso negato: richiesti privilegi admin")
    );

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Accesso negato: richiesti privilegi admin",
    });
  });

  it("returns the dashboard read model with gates, pipeline snapshot and list items", async () => {
    mockEventSubmissionFindMany.mockResolvedValue([
      {
        id: "sub-1",
        title: "Evento bridge",
        description: "Descrizione",
        category: "Sport",
        closesAt: new Date("2026-06-01T12:00:00.000Z"),
        resolutionSource: "https://example.com/source",
        status: "APPROVED",
        reviewNotes: null,
        eventId: "evt-1",
        notifyPhone: null,
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
        updatedAt: new Date("2026-05-01T10:05:00.000Z"),
        reviewedAt: null,
        reviewedById: null,
        submittedById: "user-1",
      },
    ]);
    mockUserFindMany.mockResolvedValue([
      {
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        credits: 123,
        creditsMicros: 4_000_000n,
      },
    ]);
    mockEventFindMany.mockResolvedValue([
      {
        id: "evt-1",
        title: "Evento bridge",
        category: "Sport",
        status: "OPEN",
        resolutionStatus: "PENDING",
        closesAt: new Date("2026-06-01T12:00:00.000Z"),
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
        updatedAt: new Date("2026-05-01T10:05:00.000Z"),
        resolved: false,
        outcome: null,
        marketId: "PM-2026-00001",
        tradingMode: "AMM",
        totalCredits: 1500,
        resolutionSourceUrl: "https://example.com/source",
      },
    ]);

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.gates).toEqual({
      mdeEnforceValidation: false,
      enableLegacyPipelineV2: false,
    });
    expect(payload.pipelineSnapshot).toEqual(
      expect.objectContaining({
        runId: "run-1",
        createdCount: 1,
        candidatesCount: 4,
      })
    );
    expect(payload.submissions).toHaveLength(1);
    expect(payload.submissions[0]).toEqual(
      expect.objectContaining({
        id: "sub-1",
        eventId: "evt-1",
        submissionResult: expect.objectContaining({ label: "Published to event" }),
      })
    );
    expect(payload.submissions[0].actionSurface.availableActionKeys).toEqual(
      expect.arrayContaining(["open_detail", "open_event"])
    );
  });

  it("returns detail view model with audit and credits summaries", async () => {
    mockEventSubmissionFindUnique.mockResolvedValue({
      id: "sub-1",
      title: "Evento bridge",
      description: "Descrizione",
      category: "Sport",
      closesAt: new Date("2026-06-01T12:00:00.000Z"),
      resolutionSource: "https://example.com/source",
      status: "APPROVED",
      reviewNotes: null,
      eventId: "evt-1",
      notifyPhone: "+39000111222",
      createdAt: new Date("2026-05-01T10:00:00.000Z"),
      updatedAt: new Date("2026-05-01T10:05:00.000Z"),
      reviewedAt: null,
      reviewedById: null,
      submittedById: "user-1",
    });
    mockUserFindUnique.mockImplementation(async ({ where }: { where: { id: string } }) => {
      if (where.id === "user-1") {
        return {
          id: "user-1",
          name: "Alice",
          email: "alice@example.com",
          credits: 200,
          creditsMicros: 12_000_000n,
        };
      }
      return { role: "ADMIN" };
    });
    mockEventFindUnique.mockResolvedValue({
      id: "evt-1",
      title: "Evento bridge",
      category: "Sport",
      status: "OPEN",
      resolutionStatus: "PENDING",
      closesAt: new Date("2026-06-01T12:00:00.000Z"),
      createdAt: new Date("2026-05-01T10:00:00.000Z"),
      updatedAt: new Date("2026-05-01T10:05:00.000Z"),
      resolved: false,
      outcome: null,
      marketId: "PM-2026-00001",
      tradingMode: "AMM",
      totalCredits: 1500,
      resolutionSourceUrl: "https://example.com/source",
    });
    mockAuditLogFindMany.mockResolvedValue([
      {
        id: "aud-1",
        createdAt: new Date("2026-05-01T10:06:00.000Z"),
        action: "EVENT_CREATE",
        entityType: "event",
        entityId: "evt-1",
        userId: "admin-1",
      },
    ]);
    mockUserFindMany.mockResolvedValue([
      {
        id: "admin-1",
        name: "Admin",
        email: "admin@example.com",
      },
    ]);

    const { GET } = await import("./[id]/route");
    const response = await GET(
      new NextRequest("http://localhost/api/admin/operations/sub-1"),
      { params: Promise.resolve({ id: "sub-1" }) }
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.submission).toEqual(
      expect.objectContaining({
        id: "sub-1",
        eventId: "evt-1",
        notifyPhone: "+39000111222",
      })
    );
    expect(payload.pipelineSummary).toEqual(
      expect.objectContaining({
        state: "published",
        validationMode: "shadow",
      })
    );
    expect(payload.auditSummary.items[0]).toEqual(
      expect.objectContaining({
        action: "EVENT_CREATE",
        actorLabel: "Admin",
      })
    );
    expect(payload.creditsSummary).toEqual(
      expect.objectContaining({
        displayCredits: 12,
      })
    );
    expect(payload.permissions.actionSurface.availableActionKeys).toEqual(
      expect.arrayContaining(["open_event", "view_audit", "view_credits"])
    );
  });
});
