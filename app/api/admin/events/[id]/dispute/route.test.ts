import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockRequireAdminCapability = vi.fn();
const mockFindUnique = vi.fn();
const mockEventUpdate = vi.fn();
const mockTransactionFindMany = vi.fn();
const mockUserUpdate = vi.fn();
const mockTransactionDeleteMany = vi.fn();
const mockCreateAuditLog = vi.fn();

vi.mock("@/lib/admin", () => ({
  requireAdminCapability: (...args: unknown[]) => mockRequireAdminCapability(...args),
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockEventUpdate(...args),
    },
    transaction: {
      findMany: (...args: unknown[]) => mockTransactionFindMany(...args),
      deleteMany: (...args: unknown[]) => mockTransactionDeleteMany(...args),
    },
    user: {
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
  },
}));

describe("POST /api/admin/events/[id]/dispute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdminCapability.mockResolvedValue({ id: "admin-1" });
    mockFindUnique.mockResolvedValue({
      id: "evt-1",
      resolved: true,
      resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
      outcome: "YES",
      tradingMode: "AMM",
    });
    mockEventUpdate.mockResolvedValue({});
    mockCreateAuditLog.mockResolvedValue({});
    mockTransactionFindMany.mockResolvedValue([]);
    mockUserUpdate.mockResolvedValue({});
    mockTransactionDeleteMany.mockResolvedValue({ count: 0 });
  });

  it("returns deny-first 403 when resolve capability is missing", async () => {
    mockRequireAdminCapability.mockRejectedValue(new Error("Accesso negato: richiesti privilegi admin"));

    const { POST } = await import("./route");
    const response = await POST(
      new NextRequest("http://localhost/api/admin/events/evt-1/dispute", {
        method: "POST",
        body: JSON.stringify({ action: "APPROVE" }),
      }),
      { params: Promise.resolve({ id: "evt-1" }) }
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Accesso negato: richiesti privilegi admin",
    });
  });

  it("returns a legacy-compatible success message for APPROVE", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new NextRequest("http://localhost/api/admin/events/evt-1/dispute", {
        method: "POST",
        body: JSON.stringify({ action: "APPROVE" }),
      }),
      { params: Promise.resolve({ id: "evt-1" }) }
    );

    expect(mockRequireAdminCapability).toHaveBeenCalledWith("events:resolve");
    expect(mockEventUpdate).toHaveBeenCalledWith({
      where: { id: "evt-1" },
      data: {
        resolutionDisputedAt: null,
        resolutionDisputedBy: null,
      },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      action: "APPROVE",
      message: "Risoluzione approvata con successo.",
    });
  });

  it("returns a legacy-compatible success message for REJECT", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new NextRequest("http://localhost/api/admin/events/evt-1/dispute", {
        method: "POST",
        body: JSON.stringify({ action: "REJECT" }),
      }),
      { params: Promise.resolve({ id: "evt-1" }) }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      action: "REJECT",
      message: "Risoluzione contestata con successo.",
    });
  });
});
