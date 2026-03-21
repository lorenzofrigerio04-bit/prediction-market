import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockRequireAdminCapability = vi.fn();
const mockEventFindMany = vi.fn();
const mockEventFindUnique = vi.fn();
const mockPredictionFindMany = vi.fn();
const mockNotificationCreate = vi.fn();
const mockTransaction = vi.fn();
const mockGetPipelineMetrics = vi.fn();
const mockRunSimulatedActivity = vi.fn();
const mockResolveMarketMarkResolved = vi.fn();
const mockPayoutMarketInBatches = vi.fn();
const mockCreateAuditLog = vi.fn();
const mockInvalidatePriceCache = vi.fn();
const mockInvalidateTrendingCache = vi.fn();
const mockInvalidateAllFeedCaches = vi.fn();

vi.mock("@/lib/admin", () => ({
  requireAdminCapability: (...args: unknown[]) => mockRequireAdminCapability(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      findMany: (...args: unknown[]) => mockEventFindMany(...args),
      findUnique: (...args: unknown[]) => mockEventFindUnique(...args),
    },
    prediction: {
      findMany: (...args: unknown[]) => mockPredictionFindMany(...args),
    },
    notification: {
      create: (...args: unknown[]) => mockNotificationCreate(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

vi.mock("@/lib/event-gen-v2/metrics", () => ({
  getPipelineMetrics: (...args: unknown[]) => mockGetPipelineMetrics(...args),
}));

vi.mock("@/lib/simulated-activity", () => ({
  runSimulatedActivity: (...args: unknown[]) => mockRunSimulatedActivity(...args),
}));

vi.mock("@/lib/simulated-activity/config", () => ({
  ENABLE_SIMULATED_ACTIVITY: true,
}));

vi.mock("@/lib/amm/resolve", () => ({
  resolveMarketMarkResolved: (...args: unknown[]) => mockResolveMarketMarkResolved(...args),
  payoutMarketInBatches: (...args: unknown[]) => mockPayoutMarketInBatches(...args),
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}));

vi.mock("@/lib/cache/price", () => ({
  invalidatePriceCache: (...args: unknown[]) => mockInvalidatePriceCache(...args),
}));

vi.mock("@/lib/cache/trending", () => ({
  invalidateTrendingCache: (...args: unknown[]) => mockInvalidateTrendingCache(...args),
}));

vi.mock("@/lib/feed-cache", () => ({
  invalidateAllFeedCaches: (...args: unknown[]) => mockInvalidateAllFeedCaches(...args),
}));

vi.mock("@/lib/missions", () => ({
  updateMissionProgress: vi.fn(),
}));

vi.mock("@/lib/missions/mission-progress-service", () => ({
  handleMissionEvent: vi.fn(),
}));

vi.mock("@/lib/badges", () => ({
  checkAndAwardBadges: vi.fn(),
}));

describe("admin capability hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdminCapability.mockResolvedValue({ id: "admin-1" });
    mockCreateAuditLog.mockResolvedValue({});
    mockInvalidatePriceCache.mockResolvedValue(undefined);
    mockInvalidateTrendingCache.mockResolvedValue(undefined);
    mockInvalidateAllFeedCaches.mockResolvedValue(undefined);
    mockPredictionFindMany.mockResolvedValue([]);
    mockNotificationCreate.mockResolvedValue({});
    mockResolveMarketMarkResolved.mockResolvedValue(undefined);
    mockPayoutMarketInBatches.mockResolvedValue({ paidUserIds: [] });
    mockTransaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({}));
  });

  it("denies pipeline metrics when pipeline capability is missing", async () => {
    mockRequireAdminCapability.mockRejectedValue(new Error("Accesso negato: richiesti privilegi admin"));

    const { GET } = await import("./pipeline-metrics/route");
    const response = await GET(
      new NextRequest("http://localhost/api/admin/pipeline-metrics?hoursBack=24")
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Accesso negato: richiesti privilegi admin",
    });
  });

  it("allows pipeline metrics with the mapped pipeline capability", async () => {
    mockGetPipelineMetrics.mockResolvedValue({ createdCount: 3, skippedCount: 1 });

    const { GET } = await import("./pipeline-metrics/route");
    const response = await GET(
      new NextRequest("http://localhost/api/admin/pipeline-metrics?hoursBack=12")
    );

    expect(mockRequireAdminCapability).toHaveBeenCalledWith("pipeline:run");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      hoursBack: 12,
      metrics: { createdCount: 3, skippedCount: 1 },
      timestamp: expect.any(String),
    });
  });

  it("allows disputes listing only through events:resolve and preserves legacy count shape", async () => {
    mockEventFindMany.mockResolvedValue([
      {
        id: "evt-1",
        title: "Evento risolto",
        resolved: true,
        resolvedAt: new Date("2026-03-01T10:00:00.000Z"),
        createdBy: { id: "u1", name: "Admin", email: "admin@example.com" },
        _count: { Prediction: 2, Trade: 3 },
      },
    ]);

    const { GET } = await import("./disputes/route");
    const response = await GET(
      new NextRequest("http://localhost/api/admin/disputes")
    );

    expect(mockRequireAdminCapability).toHaveBeenCalledWith("events:resolve");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      events: [
        expect.objectContaining({
          id: "evt-1",
          _count: { predictions: 5 },
        }),
      ],
    });
  });

  it("allows event detail reads only through events:create", async () => {
    mockEventFindUnique.mockResolvedValue({
      id: "evt-1",
      title: "Evento",
      createdBy: { id: "u1", name: "Admin", email: "admin@example.com" },
    });

    const { GET } = await import("./events/[id]/route");
    const response = await GET(
      new NextRequest("http://localhost/api/admin/events/evt-1"),
      { params: Promise.resolve({ id: "evt-1" }) }
    );

    expect(mockRequireAdminCapability).toHaveBeenCalledWith("events:create");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "evt-1",
      title: "Evento",
      createdBy: { id: "u1", name: "Admin", email: "admin@example.com" },
    });
  });

  it("denies simulated activity when pipeline capability is missing", async () => {
    mockRequireAdminCapability.mockRejectedValue(new Error("Accesso negato: richiesti privilegi admin"));

    const { POST } = await import("./run-simulated-activity/route");
    const response = await POST();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Accesso negato: richiesti privilegi admin",
    });
  });

  it("allows simulated activity when pipeline capability is present", async () => {
    mockRunSimulatedActivity.mockResolvedValue({ ok: true, predictions: 4 });

    const { POST } = await import("./run-simulated-activity/route");
    const response = await POST();

    expect(mockRequireAdminCapability).toHaveBeenCalledWith("pipeline:run");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      predictions: 4,
    });
  });

  it("allows resolve actions only through events:resolve", async () => {
    mockEventFindUnique.mockResolvedValue({
      id: "evt-1",
      title: "Evento",
      resolved: false,
      tradingMode: "AMM",
      resolutionSourceUrl: "https://example.com/source",
    });

    const { POST } = await import("./events/[id]/resolve/route");
    const response = await POST(
      new NextRequest("http://localhost/api/admin/events/evt-1/resolve", {
        method: "POST",
        body: JSON.stringify({ outcome: "YES" }),
      }),
      { params: Promise.resolve({ id: "evt-1" }) }
    );

    expect(mockRequireAdminCapability).toHaveBeenCalledWith("events:resolve");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });
});
