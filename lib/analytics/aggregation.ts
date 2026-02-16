/**
 * Hourly aggregation of market metrics: volume, uniqueUsers, impressions, clicks.
 * Writes to MarketMetrics and computes success score per market per hour.
 */

import type { PrismaClient } from "@prisma/client";
import { calculateSuccessScore, type HourlyMetrics } from "./metrics";

/** Truncate a date to the start of its hour (UTC). */
export function truncateToHour(d: Date): Date {
  const out = new Date(d);
  out.setUTCMinutes(0, 0, 0);
  return out;
}

export interface AggregateOptions {
  /** Hour to aggregate (will be truncated to hour). Default: previous full hour. */
  hour?: Date;
}

export interface AggregateResult {
  hour: Date;
  bucketsWritten: number;
  errors: string[];
}

/**
 * Aggregate metrics for one hour and upsert into MarketMetrics.
 * - volume, uniqueUsers: from Prediction (createdAt in that hour), by eventId
 * - impressions, clicks: from MarketAnalyticsRaw (eventType impression/click) in that hour
 * - successScore: (volumeRate*0.4) + (userRate*0.3) + (ctr*0.3)
 */
export async function runHourlyAggregation(
  prisma: PrismaClient,
  options: AggregateOptions = {}
): Promise<AggregateResult> {
  const now = new Date();
  const hourToAggregate = options.hour
    ? truncateToHour(options.hour)
    : (() => {
        const prev = new Date(now);
        prev.setUTCHours(prev.getUTCHours() - 1);
        return truncateToHour(prev);
      })();

  const hourEnd = new Date(hourToAggregate.getTime() + 60 * 60 * 1000);
  const errors: string[] = [];

  // 1) Predictions in this hour: volume (costBasis ?? credits), uniqueUsers per eventId
  const predictions = await prisma.prediction.findMany({
    where: {
      createdAt: { gte: hourToAggregate, lt: hourEnd },
    },
    select: {
      eventId: true,
      userId: true,
      credits: true,
      costBasis: true,
    },
  });

  const volumeByEvent = new Map<string, { volume: number; userIds: Set<string> }>();
  for (const p of predictions) {
    const vol = p.costBasis != null ? Number(p.costBasis) : (p.credits ?? 0);
    let cur = volumeByEvent.get(p.eventId);
    if (!cur) {
      cur = { volume: 0, userIds: new Set() };
      volumeByEvent.set(p.eventId, cur);
    }
    cur.volume += vol;
    cur.userIds.add(p.userId);
  }

  // 2) Raw analytics in this hour: impressions and clicks per eventId
  const rawRows = await prisma.marketAnalyticsRaw.findMany({
    where: {
      createdAt: { gte: hourToAggregate, lt: hourEnd },
    },
    select: { eventId: true, eventType: true },
  });

  const impressionsByEvent = new Map<string, number>();
  const clicksByEvent = new Map<string, number>();
  for (const r of rawRows) {
    if (r.eventType === "impression") {
      impressionsByEvent.set(r.eventId, (impressionsByEvent.get(r.eventId) ?? 0) + 1);
    } else if (r.eventType === "click") {
      clicksByEvent.set(r.eventId, (clicksByEvent.get(r.eventId) ?? 0) + 1);
    }
  }

  // 3) All eventIds that have any activity in this hour
  const eventIds = new Set<string>([
    ...volumeByEvent.keys(),
    ...impressionsByEvent.keys(),
    ...clicksByEvent.keys(),
  ]);

  let bucketsWritten = 0;
  for (const eventId of eventIds) {
    const volData = volumeByEvent.get(eventId);
    const volume = volData?.volume ?? 0;
    const uniqueUsers = volData?.userIds.size ?? 0;
    const impressions = impressionsByEvent.get(eventId) ?? 0;
    const clicks = clicksByEvent.get(eventId) ?? 0;

    const metrics: HourlyMetrics = {
      volume,
      uniqueUsers,
      impressions,
      clicks,
    };
    const successScore = calculateSuccessScore(metrics, 1);

    try {
      await prisma.marketMetrics.upsert({
        where: {
          eventId_hour: { eventId, hour: hourToAggregate },
        },
        create: {
          eventId,
          hour: hourToAggregate,
          volume,
          uniqueUsers,
          impressions,
          clicks,
          successScore,
        },
        update: {
          volume,
          uniqueUsers,
          impressions,
          clicks,
          successScore,
        },
      });
      bucketsWritten += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`eventId ${eventId}: ${msg}`);
    }
  }

  return {
    hour: hourToAggregate,
    bucketsWritten,
    errors,
  };
}
