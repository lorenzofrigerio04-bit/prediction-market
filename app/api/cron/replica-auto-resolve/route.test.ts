import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetClosed = vi.fn();
const mockResolve = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/resolution/replica-auto-resolve", () => ({
  getClosedUnresolvedReplicaEvents: (...args: unknown[]) => mockGetClosed(...args),
  resolveReplicaEventFromOfficialSource: (...args: unknown[]) => mockResolve(...args),
}));

vi.mock("@/lib/canonical-base-url", () => ({
  getCanonicalBaseUrl: () => "http://localhost:3000",
}));

describe("GET /api/cron/replica-auto-resolve", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CRON_SECRET;
    mockGetClosed.mockResolvedValue([]);
  });

  it("returns success payload", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new NextRequest("http://localhost/api/cron/replica-auto-resolve", {
        method: "GET",
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.checked).toBe(0);
  });
});
