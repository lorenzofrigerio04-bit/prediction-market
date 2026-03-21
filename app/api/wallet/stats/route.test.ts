import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetServerSession = vi.fn();
const mockFindUnique = vi.fn();
const mockFindFirst = vi.fn();
const mockAggregate = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: () => mockGetServerSession(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    transaction: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      aggregate: (...args: unknown[]) => mockAggregate(...args),
    },
  },
}));

describe("GET /api/wallet/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a legacy-compatible wallet read-model shape", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "wallet-user" } });
    mockFindUnique.mockResolvedValue({
      credits: 12,
      creditsMicros: 5_900_000n,
      totalEarned: 220,
      streakCount: null,
    });
    mockFindFirst.mockResolvedValue(null);
    mockAggregate.mockResolvedValue({
      _sum: { amount: -125 },
    });

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      credits: 5,
      creditsMicros: "5900000",
      totalEarned: 220,
      totalSpent: 125,
      streak: 0,
      streakCount: 0,
      canClaimDailyBonus: true,
      nextBonusAmount: 50,
      canSpinToday: true,
      todaySpinCredits: null,
      boostMultiplier: 0,
      boostExpiresAt: null,
      hasActiveBoost: false,
    });
  });

  it("denies unauthenticated access", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Non autenticato",
    });
  });
});
