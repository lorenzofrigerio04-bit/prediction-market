/**
 * Unit tests for feed candidate generation (40% trending, 50% personalized, 10% exploration).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateFeedCandidates } from "./candidate-generation";
import type { PrismaClient } from "@prisma/client";

describe("generateFeedCandidates", () => {
  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  function event(id: string, overrides: Record<string, unknown> = {}) {
    return {
      id,
      category: "Sport",
      closesAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      totalCredits: 500,
      b: 100,
      ...overrides,
    };
  }

  function metrics(eventId: string, volume: number, impressions: number) {
    return { eventId, volume, impressions };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no open events", async () => {
    const prisma = {
      event: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      marketMetrics: { findMany: vi.fn().mockResolvedValue([]) },
      userProfile: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient;

    const result = await generateFeedCandidates(prisma, null, 20);
    expect(result).toEqual([]);
  });

  it("respects 40/50/10 mix for limit 20", async () => {
    const events = [
      event("e1", { createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) }),
      event("e2"),
      event("e3"),
      event("e4"),
      event("e5"),
      event("e6"),
      event("e7"),
      event("e8"),
      event("e9"),
      event("e10"),
      event("e11"),
      event("e12"),
      event("e13"),
      event("e14"),
      event("e15"),
      event("e16"),
      event("e17"),
      event("e18"),
      event("e19"),
      event("e20"),
    ];
    const metricsRows = [
      metrics("e1", 100, 10),
      metrics("e2", 90, 20),
      metrics("e3", 80, 30),
      ...events.slice(3).map((e, i) => metrics(e.id, 70 - i, 5 + i)),
    ];

    const prisma = {
      event: { findMany: vi.fn().mockResolvedValue(events) },
      marketMetrics: { findMany: vi.fn().mockResolvedValue(metricsRows) },
      userProfile: {
        findUnique: vi.fn().mockResolvedValue({
          preferredCategories: { Sport: 1 },
          riskTolerance: "MEDIUM",
          preferredHorizon: "MEDIUM",
        }),
      },
    } as unknown as PrismaClient;

    const result = await generateFeedCandidates(prisma, "user-1", 20);
    expect(result.length).toBeLessThanOrEqual(20);

    const bySource = { trending: 0, personalized: 0, exploration: 0 };
    for (const c of result) {
      bySource[c.source]++;
    }
    expect(bySource.trending).toBe(8);
    expect(bySource.personalized).toBe(10);
    expect(bySource.exploration).toBe(2);
  });

  it("includes trending first (by volume_6h / age)", async () => {
    const events = [
      event("high", { createdAt: new Date(sixHoursAgo.getTime()) }),
      event("low", { createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }),
    ];
    const metricsRows = [
      metrics("high", 100, 50),
      metrics("low", 10, 5),
    ];

    const prisma = {
      event: { findMany: vi.fn().mockResolvedValue(events) },
      marketMetrics: { findMany: vi.fn().mockResolvedValue(metricsRows) },
      userProfile: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient;

    const result = await generateFeedCandidates(prisma, null, 20);
    const trending = result.filter((c) => c.source === "trending");
    expect(trending.length).toBeGreaterThanOrEqual(1);
    expect(trending[0].eventId).toBe("high");
  });

  it("personalized candidates have score", async () => {
    const events = [
      event("e1"),
      event("e2"),
      event("e3"),
      event("e4"),
      event("e5"),
      event("e6"),
      event("e7"),
      event("e8"),
      event("e9"),
      event("e10"),
      event("e11"),
      event("e12"),
      event("e13"),
      event("e14"),
      event("e15"),
      event("e16"),
      event("e17"),
      event("e18"),
      event("e19"),
      event("e20"),
    ];
    const metricsRows = events.map((e) => metrics(e.id, 10, 5));

    const prisma = {
      event: { findMany: vi.fn().mockResolvedValue(events) },
      marketMetrics: { findMany: vi.fn().mockResolvedValue(metricsRows) },
      userProfile: {
        findUnique: vi.fn().mockResolvedValue({
          preferredCategories: { Sport: 1 },
          riskTolerance: "MEDIUM",
          preferredHorizon: "MEDIUM",
        }),
      },
    } as unknown as PrismaClient;

    const result = await generateFeedCandidates(prisma, "user-1", 20);
    const personalized = result.filter((c) => c.source === "personalized");
    expect(personalized.length).toBe(10);
    expect(personalized.every((c) => typeof c.score === "number")).toBe(true);
  });

  it("exploration candidates come from pool (no duplicate eventIds in result)", async () => {
    const events = Array.from({ length: 25 }, (_, i) =>
      event(`e${i}`, { category: i % 2 === 0 ? "Sport" : "Tech" })
    );
    const metricsRows = events.map((e, i) =>
      metrics(e.id, 5, i < 10 ? 1 : 100)
    );

    const prisma = {
      event: { findMany: vi.fn().mockResolvedValue(events) },
      marketMetrics: { findMany: vi.fn().mockResolvedValue(metricsRows) },
      userProfile: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient;

    const result = await generateFeedCandidates(prisma, null, 20);
    const ids = result.map((c) => c.eventId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
