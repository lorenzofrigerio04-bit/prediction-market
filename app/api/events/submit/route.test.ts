import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetServerSession = vi.fn();
const mockValidateEventSubmission = vi.fn();
const mockCreateEventFromSubmission = vi.fn();
const mockValidateAgainstMdeContract = vi.fn();
const mockEventSubmissionCreate = vi.fn();
const mockNotificationCreate = vi.fn();
const mockManualDraftToCandidate = vi.fn();
const mockValidateCandidates = vi.fn();
const mockScoreCandidate = vi.fn();
const mockPublishSelectedV2 = vi.fn();
const mockHandleMissionEvent = vi.fn();
const mockCheckAndAwardBadges = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: () => mockGetServerSession(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    eventSubmission: {
      create: (...args: unknown[]) => mockEventSubmissionCreate(...args),
    },
    notification: {
      create: (...args: unknown[]) => mockNotificationCreate(...args),
    },
  },
}));

vi.mock("@/lib/event-submission/validate", () => ({
  validateEventSubmission: (...args: unknown[]) => mockValidateEventSubmission(...args),
  createEventFromSubmission: (...args: unknown[]) => mockCreateEventFromSubmission(...args),
}));

vi.mock("@/lib/integration/adapters/market-design-shadow-validator", () => ({
  validateAgainstMdeContract: (...args: unknown[]) => mockValidateAgainstMdeContract(...args),
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

vi.mock("@/lib/missions/mission-progress-service", () => ({
  handleMissionEvent: (...args: unknown[]) => mockHandleMissionEvent(...args),
}));

vi.mock("@/lib/badges", () => ({
  checkAndAwardBadges: (...args: unknown[]) => mockCheckAndAwardBadges(...args),
}));

describe("POST /api/events/submit", () => {
  const savedMdeEnforce = process.env.MDE_ENFORCE_VALIDATION;
  const savedMdeAuthoritative = process.env.MDE_AUTHORITATIVE_MANUAL_SUBMIT;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MDE_ENFORCE_VALIDATION;
    delete process.env.MDE_AUTHORITATIVE_MANUAL_SUBMIT;

    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    });
    mockValidateAgainstMdeContract.mockReturnValue({ valid: true });
    mockNotificationCreate.mockResolvedValue({ id: "notif-1" });
    mockHandleMissionEvent.mockResolvedValue(undefined);
    mockCheckAndAwardBadges.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (savedMdeEnforce === undefined) {
      delete process.env.MDE_ENFORCE_VALIDATION;
    } else {
      process.env.MDE_ENFORCE_VALIDATION = savedMdeEnforce;
    }
    if (savedMdeAuthoritative === undefined) {
      delete process.env.MDE_AUTHORITATIVE_MANUAL_SUBMIT;
    } else {
      process.env.MDE_AUTHORITATIVE_MANUAL_SUBMIT = savedMdeAuthoritative;
    }
  });

  it("publishes a valid submission through MDE path (no legacy createEventFromSubmission)", async () => {
    mockValidateEventSubmission.mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      dedupKey: "dedup-1",
      normalizedCategory: "Sport",
    });
    const fakeCandidate = {
      title: "L'Inter vincerà lo scudetto?",
      description: "Match point nelle ultime giornate.",
      category: "Sport",
      closesAt: new Date("2026-07-01T12:00:00.000Z"),
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
      eventIds: ["evt-1"],
    });
    mockEventSubmissionCreate.mockResolvedValue({ id: "sub-1" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "  L'Inter vincerà lo scudetto?  ",
          description: "  Match point nelle ultime giornate.  ",
          category: "  Sport ",
          closesAt: "2026-07-01T12:00:00.000Z",
          resolutionSource: "  https://example.com/inter  ",
          notifyPhone: "  +39000111222  ",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      success: true,
      approved: true,
      eventId: "evt-1",
      submissionId: "sub-1",
      message: "Evento pubblicato con successo.",
    });
    expect(mockValidateEventSubmission).toHaveBeenCalledWith({
      title: "L'Inter vincerà lo scudetto?",
      description: "Match point nelle ultime giornate.",
      category: "Sport",
      closesAt: new Date("2026-07-01T12:00:00.000Z"),
      resolutionSource: "https://example.com/inter",
    });
    expect(mockManualDraftToCandidate).toHaveBeenCalled();
    expect(mockValidateCandidates).toHaveBeenCalled();
    expect(mockPublishSelectedV2).toHaveBeenCalled();
    expect(mockCreateEventFromSubmission).not.toHaveBeenCalled();
    expect(mockEventSubmissionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "L'Inter vincerà lo scudetto?",
        description: "Match point nelle ultime giornate.",
        category: "Sport",
        status: "APPROVED",
        eventId: "evt-1",
        notifyPhone: "+39000111222",
      }),
    });
  });

  it("keeps legacy-compatible pending review flow for supported but non-perfect shapes", async () => {
    mockValidateEventSubmission.mockResolvedValue({
      valid: false,
      errors: ["Categoria non valida"],
      warnings: [],
    });
    mockEventSubmissionCreate.mockResolvedValue({ id: "sub-pending-1" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "  La finale finirà ai rigori?  ",
          description: "   ",
          category: "  sport-ext  ",
          closesAt: "2026-07-02T12:00:00.000Z",
          resolutionSource: "   ",
          notifyPhone: "   ",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      success: true,
      approved: false,
      pendingReview: true,
      submissionId: "sub-pending-1",
      message: "Il tuo evento è in revisione. Ti avviseremo quando verrà approvato.",
    });
    expect(mockCreateEventFromSubmission).not.toHaveBeenCalled();
    expect(mockEventSubmissionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "La finale finirà ai rigori?",
        description: null,
        category: "sport-ext",
        resolutionSource: null,
        notifyPhone: null,
        status: "PENDING",
        reviewNotes: "Categoria non valida",
      }),
    });
    expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
  });

  it("keeps shadow validation non-blocking when enforce mode is disabled (MDE path still runs)", async () => {
    mockValidateEventSubmission.mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      dedupKey: "dedup-shadow",
      normalizedCategory: "Sport",
    });
    mockValidateAgainstMdeContract.mockReturnValue({
      valid: false,
      reason: "MDE_SHADOW_TITLE_TOO_SHORT",
    });
    const fakeCandidate = {
      title: "Titolo legacy valido?",
      description: "Descrizione",
      category: "Sport",
      closesAt: new Date("2026-07-03T12:00:00.000Z"),
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
      eventIds: ["evt-shadow"],
    });
    mockEventSubmissionCreate.mockResolvedValue({ id: "sub-shadow" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Titolo legacy valido?",
          description: "Descrizione",
          category: "Sport",
          closesAt: "2026-07-03T12:00:00.000Z",
          resolutionSource: "https://example.com/source",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.approved).toBe(true);
    expect(data.eventId).toBe("evt-shadow");
    expect(mockCreateEventFromSubmission).not.toHaveBeenCalled();
  });

  it("blocks immediate publication in enforce mode and falls back to pending review", async () => {
    process.env.MDE_ENFORCE_VALIDATION = "true";
    mockValidateEventSubmission.mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      dedupKey: "dedup-enforce",
      normalizedCategory: "Sport",
    });
    mockValidateAgainstMdeContract.mockReturnValue({
      valid: false,
      reason: "MDE_SHADOW_TITLE_TOO_SHORT",
    });
    mockEventSubmissionCreate.mockResolvedValue({ id: "sub-enforce" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Titolo legacy valido?",
          description: "Descrizione",
          category: "Sport",
          closesAt: "2026-07-04T12:00:00.000Z",
          resolutionSource: "https://example.com/source",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      success: true,
      approved: false,
      pendingReview: true,
      submissionId: "sub-enforce",
      message: "Il tuo evento è in revisione. Ti avviseremo quando verrà approvato.",
    });
    expect(mockCreateEventFromSubmission).not.toHaveBeenCalled();
    expect(mockEventSubmissionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "PENDING",
        reviewNotes: "MDE_SHADOW_TITLE_TOO_SHORT",
      }),
    });
  });

  it("uses MDE path when rulebook accepts (approved, eventId from publishSelectedV2)", async () => {
    mockValidateEventSubmission.mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      dedupKey: "dedup-mde",
      normalizedCategory: "Sport",
    });
    const fakeCandidate = {
      title: "L'Inter vincerà lo scudetto?",
      description: "Match point.",
      category: "Sport",
      closesAt: new Date("2026-07-01T12:00:00.000Z"),
      resolutionAuthorityHost: "example.com",
      resolutionAuthorityType: "REPUTABLE" as const,
      resolutionCriteriaYes: "Sì",
      resolutionCriteriaNo: "No",
      sourceStorylineId: "manual",
      templateId: "manual",
      rulebookValid: true as const,
    };
    mockManualDraftToCandidate.mockReturnValue(fakeCandidate);
    mockValidateCandidates.mockReturnValue({
      valid: [fakeCandidate],
      rejected: [],
      rejectionReasons: {},
    });
    const fakeScored = {
      ...fakeCandidate,
      score: 80,
      scoreBreakdown: { momentum: 50, novelty: 50, authority: 60, clarity: 70 },
      qualityScores: { overall_score: 0.8 },
      overall_score: 0.8,
    };
    mockScoreCandidate.mockReturnValue(fakeScored);
    mockPublishSelectedV2.mockResolvedValue({
      createdCount: 1,
      skippedCount: 0,
      reasonsCount: {},
      eventIds: ["evt-mde-1"],
    });
    mockEventSubmissionCreate.mockResolvedValue({ id: "sub-mde-1" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "L'Inter vincerà lo scudetto?",
          description: "Match point.",
          category: "Sport",
          closesAt: "2026-07-01T12:00:00.000Z",
          resolutionSource: "https://example.com/inter",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      success: true,
      approved: true,
      eventId: "evt-mde-1",
      submissionId: "sub-mde-1",
      message: "Evento pubblicato con successo.",
    });
    expect(mockPublishSelectedV2).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Array),
      expect.any(Date),
      { createdById: "user-1" }
    );
    expect(mockCreateEventFromSubmission).not.toHaveBeenCalled();
    expect(mockEventSubmissionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "APPROVED",
        eventId: "evt-mde-1",
      }),
    });
  });

  it("returns PENDING when rulebook rejects (no legacy fallback)", async () => {
    mockValidateEventSubmission.mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      dedupKey: "dedup-fb",
      normalizedCategory: "Sport",
    });
    const fakeCandidate = {
      title: "Rejected by rulebook?",
      description: "Desc",
      category: "Sport",
      closesAt: new Date("2026-07-01T12:00:00.000Z"),
      resolutionAuthorityHost: "example.com",
      resolutionAuthorityType: "REPUTABLE" as const,
      resolutionCriteriaYes: "Sì",
      resolutionCriteriaNo: "No",
      sourceStorylineId: "manual",
      templateId: "manual",
    };
    mockManualDraftToCandidate.mockReturnValue(fakeCandidate);
    mockValidateCandidates.mockReturnValue({
      valid: [],
      rejected: [{ candidate: fakeCandidate, reason: "RULEBOOK_V2_BLOCK" }],
      rejectionReasons: { RULEBOOK_V2_BLOCK: 1 },
    });
    mockEventSubmissionCreate.mockResolvedValue({ id: "sub-fb-1" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Rejected by rulebook?",
          description: "Desc",
          category: "Sport",
          closesAt: "2026-07-01T12:00:00.000Z",
          resolutionSource: "https://example.com/source",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.approved).toBe(false);
    expect(data.pendingReview).toBe(true);
    expect(data.eventId).toBeUndefined();
    expect(mockCreateEventFromSubmission).not.toHaveBeenCalled();
    expect(mockPublishSelectedV2).not.toHaveBeenCalled();
    expect(mockEventSubmissionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "PENDING",
        reviewNotes: "RULEBOOK_V2_BLOCK",
      }),
    });
    expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
  });

  it("returns PENDING when publish returns no events (no legacy fallback)", async () => {
    mockValidateEventSubmission.mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      dedupKey: "dedup-nocreate",
      normalizedCategory: "Sport",
    });
    const fakeCandidate = {
      title: "Publish fails?",
      description: "Desc",
      category: "Sport",
      closesAt: new Date("2026-07-01T12:00:00.000Z"),
      resolutionAuthorityHost: "example.com",
      resolutionAuthorityType: "REPUTABLE" as const,
      resolutionCriteriaYes: "Sì",
      resolutionCriteriaNo: "No",
      sourceStorylineId: "manual",
      templateId: "manual",
      rulebookValid: true as const,
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
      reasonsCount: { DUPLICATE_DEDUP_KEY: 1 },
      eventIds: [],
    });
    mockEventSubmissionCreate.mockResolvedValue({ id: "sub-nocreate-1" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Publish fails?",
          description: "Desc",
          category: "Sport",
          closesAt: "2026-07-01T12:00:00.000Z",
          resolutionSource: "https://example.com/source",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.approved).toBe(false);
    expect(data.pendingReview).toBe(true);
    expect(data.eventId).toBeUndefined();
    expect(mockPublishSelectedV2).toHaveBeenCalledTimes(1);
    expect(mockCreateEventFromSubmission).not.toHaveBeenCalled();
    expect(mockEventSubmissionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "PENDING",
      }),
    });
    expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
  });

  it("always uses MDE path when auto-approve eligible (flag unset)", async () => {
    mockValidateEventSubmission.mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      dedupKey: "dedup-mde-always",
      normalizedCategory: "Sport",
    });
    const fakeCandidate = {
      title: "Solo MDE path?",
      description: "Desc",
      category: "Sport",
      closesAt: new Date("2026-07-01T12:00:00.000Z"),
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
      eventIds: ["evt-mde-always"],
    });
    mockEventSubmissionCreate.mockResolvedValue({ id: "sub-mde-always" });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Solo MDE path?",
          description: "Desc",
          category: "Sport",
          closesAt: "2026-07-01T12:00:00.000Z",
          resolutionSource: "https://example.com/source",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.approved).toBe(true);
    expect(data.eventId).toBe("evt-mde-always");
    expect(mockManualDraftToCandidate).toHaveBeenCalled();
    expect(mockValidateCandidates).toHaveBeenCalled();
    expect(mockPublishSelectedV2).toHaveBeenCalled();
    expect(mockCreateEventFromSubmission).not.toHaveBeenCalled();
  });
});
