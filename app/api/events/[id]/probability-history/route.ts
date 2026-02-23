import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrice } from "@/lib/pricing/lmsr";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";

const MAX_POINTS = 100;
const RANGE_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

type RangeKey = keyof typeof RANGE_MS;

/**
 * GET /api/events/[id]/probability-history?range=24h|7d|30d
 * Returns time series of YES/NO percentage for the chart (credits/LMSR and AMM).
 * Downsampled to max 100 points. Appends current state so the line extends to "now".
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
    const now = new Date();
    const from = new Date(now.getTime() - rangeMs);

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
    );
    const buckets = new Map<number, { t: Date; yesPct: number }>();
    for (const row of raw) {
      const bucket = Math.floor(row.createdAt.getTime() / bucketMs) * bucketMs;
      buckets.set(bucket, {
        t: row.createdAt,
        yesPct: row.yesPct,
      });
    }
    let points = Array.from(buckets.values())
      .sort((a, b) => a.t.getTime() - b.t.getTime())
      .map(({ t, yesPct }) => ({
        t: t.toISOString(),
        yesPct: Math.round(yesPct * 10) / 10,
      }));

    // Append current probability so the chart extends to "now" (credits/LMSR or AMM)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        tradingMode: true,
        q_yes: true,
        q_no: true,
        b: true,
        ammState: { select: { qYesMicros: true, qNoMicros: true, bMicros: true } },
      },
    });
    if (event) {
      let currentYesPct: number;
      if (event.tradingMode === "AMM" && event.ammState) {
        const amm = event.ammState;
        const yesMicros = priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros);
        currentYesPct = Number((yesMicros * 100n) / SCALE);
      } else {
        const qYes = event.q_yes ?? 0;
        const qNo = event.q_no ?? 0;
        const b = event.b ?? 100;
        currentYesPct = getPrice(qYes, qNo, b, "YES") * 100;
      }
      const lastPoint = points[points.length - 1];
      const lastT = lastPoint ? new Date(lastPoint.t).getTime() : 0;
      if (now.getTime() - lastT > 60 * 1000) {
        points = [...points, { t: now.toISOString(), yesPct: Math.round(currentYesPct * 10) / 10 }];
      }
    }

    return NextResponse.json({ points });
  } catch (error) {
    console.error("Error fetching probability history:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dello storico" },
      { status: 500 }
    );
  }
}
