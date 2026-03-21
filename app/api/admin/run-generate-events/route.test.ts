import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockRequireAdminCapability = vi.fn();
const mockRunEventGenV2Pipeline = vi.fn();

vi.mock("@/lib/admin", () => ({
  requireAdminCapability: (...args: unknown[]) => mockRequireAdminCapability(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("@/lib/event-gen-v2", () => ({
  runEventGenV2Pipeline: (...args: unknown[]) => mockRunEventGenV2Pipeline(...args),
}));

describe("POST /api/admin/run-generate-events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.DISABLE_EVENT_GENERATION;
    mockRequireAdminCapability.mockResolvedValue({ id: "admin-1" });
  });

  it("returns both createdCount and legacy created alias", async () => {
    mockRunEventGenV2Pipeline.mockResolvedValue({
      eligibleStorylinesCount: 4,
      candidatesCount: 6,
      rulebookValidCount: 5,
      dedupedCandidatesCount: 4,
      selectedCount: 2,
      createdCount: 2,
      skippedCount: 0,
      reasonsCount: {},
    });

    const { POST } = await import("./route");
    const response = await POST(
      new NextRequest("http://localhost/api/admin/run-generate-events", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.createdCount).toBe(2);
    expect(data.created).toBe(2);
    expect(data.eventGenV2).toBe(true);
  });

  it("passes through discovery-backed result fields when pipeline uses discovery path", async () => {
    mockRunEventGenV2Pipeline.mockResolvedValue({
      eligibleStorylinesCount: 0,
      candidatesCount: 0,
      rulebookValidCount: 0,
      rulebookRejectedCount: 0,
      dedupedCandidatesCount: 0,
      selectedCount: 0,
      createdCount: 0,
      skippedCount: 0,
      reasonsCount: {},
      discoveryBacked: true,
      leadCount: 0,
      conversionCount: 0,
      observationIds: [],
      publishableFromDiscovery: 0,
    });

    const { POST } = await import("./route");
    const response = await POST(
      new NextRequest("http://localhost/api/admin/run-generate-events", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.discoveryBacked).toBe(true);
    expect(data.leadCount).toBe(0);
    expect(data.observationIds).toEqual([]);
  });
});
