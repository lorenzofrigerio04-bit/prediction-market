import { describe, it, expect, vi, beforeEach } from "vitest";
import { runHourlyAggregation, truncateToHour } from "./aggregation";
import type { PrismaClient } from "@prisma/client";

describe("truncateToHour", () => {
  it("truncates to start of hour UTC", () => {
    const d = new Date("2025-02-16T14:37:22.500Z");
    const t = truncateToHour(d);
    expect(t.toISOString()).toBe("2025-02-16T14:00:00.000Z");
  });
});

describe("runHourlyAggregation", () => {
  const hourStart = new Date("2025-02-16T13:00:00.000Z");
  const hourEnd = new Date("2025-02-16T14:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates predictions into volume and uniqueUsers and upserts MarketMetrics", async () => {
    const predictions = [
      { eventId: "e1", userId: "u1", credits: 100, costBasis: 95 },
      { eventId: "e1", userId: "u2", credits: 50, costBasis: 48 },
      { eventId: "e2", userId: "u1", credits: 200, costBasis: null },
    ];
    const rawRows: { eventId: string; eventType: string }[] = [
      { eventId: "e1", eventType: "impression" },
      { eventId: "e1", eventType: "impression" },
      { eventId: "e1", eventType: "click" },
    ];

    const upsertCalls: Array<{ where: unknown; create: unknown; update: unknown }> = [];
    const prisma = {
      prediction: {
        findMany: vi.fn().mockResolvedValue(predictions),
      },
      marketAnalyticsRaw: {
        findMany: vi.fn().mockResolvedValue(rawRows),
      },
      marketMetrics: {
        upsert: vi.fn().mockImplementation((args: { where: unknown; create: unknown; update: unknown }) => {
          upsertCalls.push({ where: args.where, create: args.create, update: args.update });
          return Promise.resolve({});
        }),
      },
    } as unknown as PrismaClient;

    const result = await runHourlyAggregation(prisma, { hour: hourStart });

    expect(prisma.prediction.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: { gte: hourStart, lt: hourEnd },
      },
      select: { eventId: true, userId: true, credits: true, costBasis: true },
    });
    expect(prisma.marketAnalyticsRaw.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: { gte: hourStart, lt: hourEnd },
      },
      select: { eventId: true, eventType: true },
    });

    expect(result.hour).toEqual(hourStart);
    expect(result.bucketsWritten).toBe(2); // e1 and e2
    expect(result.errors).toEqual([]);

    expect(upsertCalls).toHaveLength(2);
    const e1Bucket = upsertCalls.find((c) => (c.create as { eventId: string }).eventId === "e1");
    const e2Bucket = upsertCalls.find((c) => (c.create as { eventId: string }).eventId === "e2");

    expect(e1Bucket?.create).toMatchObject({
      eventId: "e1",
      hour: hourStart,
      volume: 95 + 48,
      uniqueUsers: 2,
      impressions: 2,
      clicks: 1,
    });
    // volumeRate=143, userRate=2, ctr=1/2=0.5 => 143*0.4 + 2*0.3 + 0.5*0.3 = 57.95
    expect((e1Bucket?.create as { successScore: number }).successScore).toBeCloseTo(57.95, 5);

    expect(e2Bucket?.create).toMatchObject({
      eventId: "e2",
      hour: hourStart,
      volume: 200,
      uniqueUsers: 1,
      impressions: 0,
      clicks: 0,
    });
  });

  it("uses credits when costBasis is null", async () => {
    const predictions = [
      { eventId: "e1", userId: "u1", credits: 100, costBasis: null },
    ];
    const prisma = {
      prediction: { findMany: vi.fn().mockResolvedValue(predictions) },
      marketAnalyticsRaw: { findMany: vi.fn().mockResolvedValue([]) },
      marketMetrics: {
        upsert: vi.fn().mockImplementation((args: { create: unknown }) => {
          expect((args.create as { volume: number }).volume).toBe(100);
          return Promise.resolve({});
        }),
      },
    } as unknown as PrismaClient;

    await runHourlyAggregation(prisma, { hour: hourStart });
  });

  it("writes no buckets when no activity", async () => {
    const prisma = {
      prediction: { findMany: vi.fn().mockResolvedValue([]) },
      marketAnalyticsRaw: { findMany: vi.fn().mockResolvedValue([]) },
      marketMetrics: { upsert: vi.fn() },
    } as unknown as PrismaClient;

    const result = await runHourlyAggregation(prisma, { hour: hourStart });
    expect(result.bucketsWritten).toBe(0);
    expect(prisma.marketMetrics.upsert).not.toHaveBeenCalled();
  });
});
