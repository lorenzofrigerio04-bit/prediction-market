import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_POINTS = 100;
const RANGE_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

type RangeKey = keyof typeof RANGE_MS;

/**
 * GET /api/events/[id]/probability-history?range=24h|7d|30d
 * Returns time series of YES percentage for the chart. Downsampled to max 100 points.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    const rangeParam = request.nextUrl.searchParams.get("range") ?? "7d";
    const rangeKey: RangeKey =
      RANGE_MS[rangeParam as RangeKey] != null
        ? (rangeParam as RangeKey)
        : "7d";
    const rangeMs = RANGE_MS[rangeKey];
    const now = Date.now();
    const from = new Date(now - rangeMs);

    const raw = await prisma.eventProbabilitySnapshot.findMany({
      where: {
        eventId,
        createdAt: { gte: from },
      },
      orderBy: { createdAt: "asc" },
      select: { yesPct: true, createdAt: true },
    });

    if (raw.length === 0) {
      return NextResponse.json({ points: [] });
    }

    // Downsample to at most MAX_POINTS: bucket by time, keep last point per bucket
    const bucketMs = Math.max(
      Math.floor(rangeMs / MAX_POINTS),
      60 * 1000
    ); // at least 1 minute
    const buckets = new Map<number, { t: Date; yesPct: number }>();
    for (const row of raw) {
      const bucket = Math.floor(row.createdAt.getTime() / bucketMs) * bucketMs;
      buckets.set(bucket, {
        t: row.createdAt,
        yesPct: row.yesPct,
      });
    }
    const points = Array.from(buckets.values())
      .sort((a, b) => a.t.getTime() - b.t.getTime())
      .map(({ t, yesPct }) => ({
        t: t.toISOString(),
        yesPct: Math.round(yesPct * 10) / 10,
      }));

    return NextResponse.json({ points });
  } catch (error) {
    console.error("Error fetching probability history:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dello storico" },
      { status: 500 }
    );
  }
}
