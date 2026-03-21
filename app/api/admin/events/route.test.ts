import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAdminCapability = vi.fn();
const mockValidateMarket = vi.fn();
const mockManualDraftToCandidate = vi.fn();
const mockValidateCandidates = vi.fn();
const mockScoreCandidate = vi.fn();
const mockPublishSelectedV2 = vi.fn();
const mockEventCreate = vi.fn();
const mockEventFindUnique = vi.fn();
const mockCreateAuditLog = vi.fn();

vi.mock("@/lib/admin", () => ({
  requireAdminCapability: (...args: unknown[]) => mockRequireAdminCapability(...args),
}));

vi.mock("@/lib/validator", () => ({
  validateMarket: (...args: unknown[]) => mockValidateMarket(...args),
}));

vi.mock("@/lib/integration/adapters/manual-submission-to-candidate-adapter", () => ({
  manualDraftToCandidate: (...args: unknown[]) => mockManualDraftToCandidate(...args),
}));

vi.mock("@/lib/event-gen-v2/rulebook-validator", () => ({
  validateCandidates: (...args: unknown[]) => mockValidateCandidates(...args),
}));

vi.mock("@/lib/event-publishing/scoring", () => ({
  scoreCandidate: (...args: unknown[]) => mockScoreCandidate(...args),
}));

vi.mock("@/lib/event-gen-v2/publisher", () => ({
  publishSelectedV2: (...args: unknown[]) => mockPublishSelectedV2(...args),
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      create: (...args: unknown[]) => mockEventCreate(...args),
      findUnique: (...args: unknown[]) => mockEventFindUnique(...args),
    },
  },
}));

describe("POST /api/admin/events", () => {
  const adminId = "admin-1";
  const now = new Date("2026-06-01T12:00:00.000Z");
  const closesAt = new Date("2026-07-01T18:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdminCapability.mockResolvedValue({ id: adminId });
    mockValidateMarket.mockReturnValue({
      valid: true,
      reasons: [],
      needsReview: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses MDE path and does not call prisma.event.create", async () => {
    vi.setSystemTime(now);
    const fakeCandidate = {
      title: "Admin event?",
      description: "Desc",
      category: "Sport",
      closesAt,
      resolutionAuthorityHost: "example.com",
      resolutionAuthorityType: "REPUTABLE" as const,
      resolutionCriteriaYes: "Sì",
      resolutionCriteriaNo: "No",
      sourceStorylineId: "manual",
      templateId: "manual",
    };
    mockManualDraftToCandidate.mockReturnValue(fakeCandidate);
    mockValidateCandidates.mockReturnValue({
      valid: [fakeCandidate],
      rejected: [],
      rejectionReasons: {},
    });
    mockScoreCandidate.mockReturnValue({
      ...fakeCandidate,
      score: 80,
      scoreBreakdown: { momentum: 50, novelty: 50, authority: 60, clarity: 70 },
    });
    mockPublishSelectedV2.mockResolvedValue({
      createdCount: 1,
      skippedCount: 0,
      reasonsCount: {},
      eventIds: ["evt-admin-1"],
    });
    const createdEvent = {
      id: "evt-admin-1",
      title: "Admin event?",
      description: "Desc",
      category: "Sport",
      closesAt,
      createdById: adminId,
      createdBy: { id: adminId, name: "Admin", email: "admin@test.com" },
    };
    mockEventFindUnique.mockResolvedValue(createdEvent);
    mockCreateAuditLog.mockResolvedValue(undefined);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Admin event?",
          description: "Desc",
          category: "Sport",
          closesAt: closesAt.toISOString(),
          resolutionSourceUrl: "https://example.com/source",
          resolutionNotes: "Notes",
        }),
      })
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.event).toMatchObject({
      id: "evt-admin-1",
      title: "Admin event?",
      description: "Desc",
      category: "Sport",
      createdById: adminId,
    });
    expect(data.event.createdBy).toMatchObject({ id: adminId, name: "Admin", email: "admin@test.com" });
    expect(mockEventCreate).not.toHaveBeenCalled();
    expect(mockValidateMarket).toHaveBeenCalled();
    expect(mockManualDraftToCandidate).toHaveBeenCalled();
    expect(mockValidateCandidates).toHaveBeenCalled();
    expect(mockPublishSelectedV2).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Array),
      expect.any(Date),
      { createdById: adminId }
    );
    expect(mockEventFindUnique).toHaveBeenCalledWith({
      where: { id: "evt-admin-1" },
      include: expect.anything(),
    });
  });

  it("returns 400 when rulebook rejects (no event created)", async () => {
    vi.setSystemTime(now);
    const fakeCandidate = {
      title: "Rejected?",
      description: "Desc",
      category: "Sport",
      closesAt,
      resolutionAuthorityHost: "example.com",
      resolutionAuthorityType: "REPUTABLE" as const,
      sourceStorylineId: "manual",
      templateId: "manual",
    };
    mockManualDraftToCandidate.mockReturnValue(fakeCandidate);
    mockValidateCandidates.mockReturnValue({
      valid: [],
      rejected: [{ candidate: fakeCandidate, reason: "RULEBOOK_V2_BLOCK" }],
      rejectionReasons: { RULEBOOK_V2_BLOCK: 1 },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Rejected?",
          description: "Desc",
          category: "Sport",
          closesAt: closesAt.toISOString(),
          resolutionSourceUrl: "https://example.com/source",
          resolutionNotes: "Notes",
        }),
      })
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("rulebook");
    expect(mockEventCreate).not.toHaveBeenCalled();
    expect(mockPublishSelectedV2).not.toHaveBeenCalled();
  });

  it("returns 500 when publish returns no eventIds (no prisma.event.create)", async () => {
    vi.setSystemTime(now);
    const fakeCandidate = {
      title: "No publish?",
      description: "Desc",
      category: "Sport",
      closesAt,
      resolutionAuthorityHost: "example.com",
      resolutionAuthorityType: "REPUTABLE" as const,
      sourceStorylineId: "manual",
      templateId: "manual",
    };
    mockManualDraftToCandidate.mockReturnValue(fakeCandidate);
    mockValidateCandidates.mockReturnValue({
      valid: [fakeCandidate],
      rejected: [],
      rejectionReasons: {},
    });
    mockScoreCandidate.mockReturnValue({
      ...fakeCandidate,
      score: 80,
      scoreBreakdown: { momentum: 50, novelty: 50, authority: 60, clarity: 70 },
    });
    mockPublishSelectedV2.mockResolvedValue({
      createdCount: 0,
      skippedCount: 1,
      reasonsCount: {},
      eventIds: [],
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "No publish?",
          description: "Desc",
          category: "Sport",
          closesAt: closesAt.toISOString(),
          resolutionSourceUrl: "https://example.com/source",
          resolutionNotes: "Notes",
        }),
      })
    );

    expect(response.status).toBe(500);
    expect(mockEventCreate).not.toHaveBeenCalled();
    expect(mockPublishSelectedV2).toHaveBeenCalledTimes(1);
  });
});
