import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getFeedbackFromMetrics,
  sourceKeyFromUrl,
} from "./feedback-loop";
import type { PrismaClient } from "@prisma/client";

describe("sourceKeyFromUrl", () => {
  it("extracts hostname lowercase without www", () => {
    expect(sourceKeyFromUrl("https://www.reuters.com/article/123")).toBe("reuters.com");
    expect(sourceKeyFromUrl("https://ANSA.it/foo")).toBe("ansa.it");
  });
  it("returns null for invalid or empty", () => {
    expect(sourceKeyFromUrl("")).toBe(null);
    expect(sourceKeyFromUrl(null)).toBe(null);
    expect(sourceKeyFromUrl(undefined)).toBe(null);
    expect(sourceKeyFromUrl("not-a-url")).toBe(null);
  });
});

describe("getFeedbackFromMetrics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-02-16T12:00:00.000Z"));
  });

  it("returns empty scores when no metrics", async () => {
    const prisma = {
      marketMetrics: { findMany: vi.fn().mockResolvedValue([]) },
      event: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient;

    const result = await getFeedbackFromMetrics(prisma, {
      lookbackHours: 720,
      minEvents: 1,
    });

    expect(result.categoryScores).toEqual({});
    expect(result.sourceScores).toEqual({});
    expect(result.categoryWeights).toEqual({});
    expect(result.sourceWeights).toEqual({});
    expect(result.eventsAnalyzed).toBe(0);
  });

  it("aggregates category and source scores from metrics", async () => {
    const metrics = [
      { eventId: "e1", successScore: 10 },
      { eventId: "e1", successScore: 20 },
      { eventId: "e2", successScore: 30 },
    ];
    const events = [
      {
        id: "e1",
        category: "Sport",
        resolutionSourceUrl: "https://www.gazzetta.it/art",
      },
      {
        id: "e2",
        category: "Sport",
        resolutionSourceUrl: "https://reuters.com/article",
      },
    ];

    const prisma = {
      marketMetrics: {
        findMany: vi.fn().mockImplementation((args: { where: unknown }) => {
          expect(args.where).toHaveProperty("hour");
          expect((args.where as { hour: { gte: Date } }).hour.gte).toBeInstanceOf(Date);
          return Promise.resolve(metrics);
        }),
      },
      event: {
        findMany: vi.fn().mockImplementation((args: { where: { id: { in: string[] } } }) => {
          expect(args.where.id.in).toEqual(expect.arrayContaining(["e1", "e2"]));
          return Promise.resolve(events);
        }),
      },
    } as unknown as PrismaClient;

    const result = await getFeedbackFromMetrics(prisma, {
      lookbackHours: 720,
      minEvents: 1,
    });

    // e1 avg = 15, e2 avg = 30. Sport: (15+30)/2 = 22.5. gazzetta.it: 15, reuters.com: 30.
    expect(result.eventsAnalyzed).toBe(2);
    expect(result.categoryScores["Sport"]).toBeCloseTo(22.5, 5);
    expect(result.sourceScores["gazzetta.it"]).toBeCloseTo(15, 5);
    expect(result.sourceScores["reuters.com"]).toBeCloseTo(30, 5);
    expect(Object.keys(result.categoryWeights)).toContain("Sport");
    expect(Object.keys(result.sourceWeights)).toEqual(
      expect.arrayContaining(["gazzetta.it", "reuters.com"])
    );
    // Weights in (0.5, 1]: higher score => higher weight
    expect(result.sourceWeights["reuters.com"]).toBeGreaterThan(
      result.sourceWeights["gazzetta.it"]
    );
  });

  it("filters by minEvents", async () => {
    const metrics = [
      { eventId: "e1", successScore: 10 },
      { eventId: "e2", successScore: 20 },
    ];
    const events = [
      { id: "e1", category: "Rare", resolutionSourceUrl: "https://rare.com/a" },
      { id: "e2", category: "Sport", resolutionSourceUrl: "https://gazzetta.it/b" },
    ];

    const prisma = {
      marketMetrics: { findMany: vi.fn().mockResolvedValue(metrics) },
      event: { findMany: vi.fn().mockResolvedValue(events) },
    } as unknown as PrismaClient;

    const result = await getFeedbackFromMetrics(prisma, {
      lookbackHours: 720,
      minEvents: 2,
    });

    // Each category/source has only 1 event, so with minEvents=2 none qualify
    expect(result.categoryScores).toEqual({});
    expect(result.sourceScores).toEqual({});
    expect(result.eventsAnalyzed).toBe(2);
  });
});
