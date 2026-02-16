/**
 * Unit tests for user profile extraction (personalization).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractPreferredCategories,
  extractRiskTolerance,
  extractPreferredHorizon,
  extractNoveltySeeking,
  computeProfileFromPredictions,
} from "./user-profile";
import type { PrismaClient } from "@prisma/client";

describe("extractPreferredCategories", () => {
  it("normalizes counts to 0-1 by max", () => {
    expect(extractPreferredCategories({ Sport: 5, Tech: 3, Politics: 2 })).toEqual({
      Sport: 1,
      Tech: 0.6,
      Politics: 0.4,
    });
  });

  it("returns empty object for no categories", () => {
    expect(extractPreferredCategories({})).toEqual({});
  });

  it("returns 1 for single category", () => {
    expect(extractPreferredCategories({ Sport: 10 })).toEqual({ Sport: 1 });
  });
});

describe("extractRiskTolerance", () => {
  it("returns LOW when ratio < 0.33", () => {
    expect(extractRiskTolerance(50, 500)).toBe("LOW");
    expect(extractRiskTolerance(100, 1000)).toBe("LOW");
  });

  it("returns MEDIUM when ratio in [0.33, 0.66]", () => {
    expect(extractRiskTolerance(400, 1000)).toBe("MEDIUM");
    expect(extractRiskTolerance(500, 1000)).toBe("MEDIUM");
  });

  it("returns HIGH when ratio > 0.66", () => {
    expect(extractRiskTolerance(800, 1000)).toBe("HIGH");
    expect(extractRiskTolerance(1000, 1000)).toBe("HIGH");
  });

  it("caps ratio at 1", () => {
    expect(extractRiskTolerance(2000, 1000)).toBe("HIGH");
  });

  it("returns MEDIUM when userCredits is 0", () => {
    expect(extractRiskTolerance(100, 0)).toBe("MEDIUM");
  });
});

describe("extractPreferredHorizon", () => {
  it("returns SHORT when avg days < 7", () => {
    expect(extractPreferredHorizon(0)).toBe("SHORT");
    expect(extractPreferredHorizon(3)).toBe("SHORT");
    expect(extractPreferredHorizon(6.9)).toBe("SHORT");
  });

  it("returns MEDIUM when avg days in [7, 30]", () => {
    expect(extractPreferredHorizon(7)).toBe("MEDIUM");
    expect(extractPreferredHorizon(15)).toBe("MEDIUM");
    expect(extractPreferredHorizon(30)).toBe("MEDIUM");
  });

  it("returns LONG when avg days > 30", () => {
    expect(extractPreferredHorizon(31)).toBe("LONG");
    expect(extractPreferredHorizon(90)).toBe("LONG");
  });
});

describe("extractNoveltySeeking", () => {
  it("returns 0 when no trades", () => {
    expect(extractNoveltySeeking(0, 0)).toBe(0);
  });

  it("returns fraction of new-market trades", () => {
    expect(extractNoveltySeeking(2, 5)).toBe(0.4);
    expect(extractNoveltySeeking(5, 5)).toBe(1);
    expect(extractNoveltySeeking(0, 5)).toBe(0);
  });
});

describe("computeProfileFromPredictions", () => {
  const userId = "user-1";

  it("returns null when user has no predictions", async () => {
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue({ credits: 1000 }) },
      prediction: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient;
    const result = await computeProfileFromPredictions(prisma, userId);
    expect(result).toBeNull();
  });

  it("returns null when user does not exist", async () => {
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue(null) },
      prediction: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient;
    const result = await computeProfileFromPredictions(prisma, userId);
    expect(result).toBeNull();
  });

  it("computes profile from one prediction", async () => {
    const now = new Date();
    const closesAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const eventCreatedAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago = new market
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue({ credits: 1000 }) },
      prediction: {
        findMany: vi.fn().mockResolvedValue([
          {
            costBasis: 100,
            credits: 100,
            createdAt: now,
            event: {
              category: "Sport",
              closesAt,
              createdAt: eventCreatedAt,
            },
          },
        ]),
      },
    } as unknown as PrismaClient;
    const result = await computeProfileFromPredictions(prisma, userId);
    expect(result).not.toBeNull();
    expect(result!.preferredCategories).toEqual({ Sport: 1 });
    expect(result!.riskTolerance).toBe("LOW"); // 100/1000 = 0.1
    expect(result!.preferredHorizon).toBe("MEDIUM"); // 14 days
    expect(result!.noveltySeeking).toBe(1); // 1/1 trade on new market
  });

  it("computes category normalization and novelty fraction", async () => {
    const now = new Date();
    const oldEvent = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newEvent = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const closesIn7 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue({ credits: 500 }) },
      prediction: {
        findMany: vi.fn().mockResolvedValue([
          { costBasis: 50, credits: 50, createdAt: now, event: { category: "Sport", closesAt: closesIn7, createdAt: oldEvent } },
          { costBasis: 50, credits: 50, createdAt: now, event: { category: "Sport", closesAt: closesIn7, createdAt: oldEvent } },
          { costBasis: 200, credits: 200, createdAt: now, event: { category: "Tech", closesAt: closesIn7, createdAt: newEvent } },
        ]),
      },
    } as unknown as PrismaClient;
    const result = await computeProfileFromPredictions(prisma, userId);
    expect(result).not.toBeNull();
    expect(result!.preferredCategories).toEqual({ Sport: 1, Tech: 0.5 }); // 2 vs 1 -> 1 and 0.5
    expect(result!.riskTolerance).toBe("LOW"); // avg 100, 500 credits -> 0.2
    expect(result!.noveltySeeking).toBe(0.33); // 1 of 3 on new market
  });
});
