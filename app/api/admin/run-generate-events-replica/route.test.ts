import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockRequireAdminCapability = vi.fn();
const mockRunReplicaPipeline = vi.fn();
const mockCreateAuditLog = vi.fn();

vi.mock("@/lib/admin", () => ({
  requireAdminCapability: (...args: unknown[]) => mockRequireAdminCapability(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("@/lib/event-replica", () => ({
  runReplicaPipeline: (...args: unknown[]) => mockRunReplicaPipeline(...args),
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}));

describe("POST /api/admin/run-generate-events-replica", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.DISABLE_EVENT_GENERATION;
    mockRequireAdminCapability.mockResolvedValue({ id: "admin-1" });
    mockCreateAuditLog.mockResolvedValue(undefined);
  });

  it("returns created alias and replica marker", async () => {
    mockRunReplicaPipeline.mockResolvedValue({
      sourceFetchedCount: 10,
      dedupedSourceCount: 9,
      italyFilteredCount: 4,
      translatedCount: 4,
      candidatesCount: 4,
      rulebookValidCount: 4,
      rulebookRejectedCount: 0,
      dedupedCandidatesCount: 4,
      selectedCount: 2,
      createdCount: 2,
      skippedCount: 0,
      reasonsCount: {},
      eventIds: ["e1", "e2"],
    });

    const { POST } = await import("./route");
    const response = await POST(
      new NextRequest("http://localhost/api/admin/run-generate-events-replica", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.replicaPipeline).toBe(true);
    expect(data.created).toBe(2);
    expect(data.createdCount).toBe(2);
  });
});
