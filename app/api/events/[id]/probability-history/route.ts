import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, pricesByOutcomeMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { isMarketTypeId, MULTI_OPTION_MARKET_TYPES, parseOutcomesJson } from "@/lib/market-types";

const MAX_POINTS = 100;
const RANGE_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

type RangeKey = keyof typeof RANGE_MS;

/**
 * GET /api/events/[id]/probability-history?range=24h|7d|30d
 * Returns time series for the chart:
 * - binary: YES/NO percentage
 * - multi-outcome: probability by outcome key
 * Downsampled to max 100 points. Appends current state so the line extends to "now".
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
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

    const eventMeta = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        marketType: true,
        outcomes: true,
        b: true,
        ammState: { select: { qYesMicros: true, qNoMicros: true, bMicros: true } },
      },
    });
    if (!eventMeta) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }

    const isMultiOutcomeMarket =
      !!eventMeta.marketType &&
      isMarketTypeId(eventMeta.marketType) &&
      MULTI_OPTION_MARKET_TYPES.includes(eventMeta.marketType);

    const outcomeOptions = parseOutcomesJson(eventMeta.outcomes) ?? [];

    if (isMultiOutcomeMarket && outcomeOptions.length >= 2) {
      const outcomeKeys = outcomeOptions.map((o) => o.key);
      const bMicros = BigInt(Math.max(1, Math.round((eventMeta.b ?? 1) * 1_000_000)));
      const tradesBeforeRange = await prisma.trade.findMany({
        where: {
          eventId,
          createdAt: { lt: from },
        },
        orderBy: { createdAt: "asc" },
        select: { outcome: true, side: true, shareMicros: true, createdAt: true },
      });
      const tradesInRange = await prisma.trade.findMany({
        where: {
          eventId,
          createdAt: { gte: from, lte: now },
        },
        orderBy: { createdAt: "asc" },
        select: { outcome: true, side: true, shareMicros: true, createdAt: true },
      });

      const qByOutcome: Record<string, bigint> = Object.fromEntries(
        outcomeKeys.map((key) => [key, 0n])
      );

      const applyTrade = (trade: { outcome: string; side: string; shareMicros: bigint }) => {
        if (!outcomeKeys.includes(trade.outcome)) return;
        const current = qByOutcome[trade.outcome] ?? 0n;
        if (trade.side === "BUY") {
          qByOutcome[trade.outcome] = current + trade.shareMicros;
          return;
        }
        if (trade.side === "SELL") {
          const next = current - trade.shareMicros;
          qByOutcome[trade.outcome] = next > 0n ? next : 0n;
        }
      };

      for (const trade of tradesBeforeRange) applyTrade(trade);

      const toPctByOutcome = (): Record<string, number> => {
        const prices = pricesByOutcomeMicros(outcomeKeys, qByOutcome, bMicros);
        const pctByOutcome: Record<string, number> = {};
        for (const key of outcomeKeys) {
          pctByOutcome[key] = Math.round(Number((prices[key] * 100n) / SCALE) * 10) / 10;
        }
        return pctByOutcome;
      };

      const rawPoints: Array<{ t: Date; outcomePctByKey: Record<string, number> }> = [
        { t: from, outcomePctByKey: toPctByOutcome() },
      ];

      for (const trade of tradesInRange) {
        applyTrade(trade);
        rawPoints.push({
          t: trade.createdAt,
          outcomePctByKey: toPctByOutcome(),
        });
      }

      const bucketMs = Math.max(Math.floor(rangeMs / MAX_POINTS), 60 * 1000);
      const buckets = new Map<number, { t: Date; outcomePctByKey: Record<string, number> }>();
      for (const row of rawPoints) {
        const bucket = Math.floor(row.t.getTime() / bucketMs) * bucketMs;
        buckets.set(bucket, row);
      }

      let points = Array.from(buckets.values())
        .sort((a, b) => a.t.getTime() - b.t.getTime())
        .map(({ t, outcomePctByKey }) => ({
          t: t.toISOString(),
          outcomePctByKey,
        }));

      if (points.length === 0) {
        points = [{ t: from.toISOString(), outcomePctByKey: toPctByOutcome() }];
      }

      const lastT = new Date(points[points.length - 1].t).getTime();
      if (now.getTime() - lastT > 60 * 1000) {
        points.push({ t: now.toISOString(), outcomePctByKey: toPctByOutcome() });
      }

      return NextResponse.json({
        mode: "multi",
        outcomes: outcomeOptions.map((o) => ({ key: o.key, label: o.label })),
        points,
      });
    }

    const raw = await prisma.eventProbabilitySnapshot.findMany({
      where: {
        eventId,
        createdAt: { gte: from },
      },
      orderBy: { createdAt: "asc" },
      select: { yesPct: true, createdAt: true },
    });

    // Se non ci sono snapshot ma l’evento ha attività AMM (almeno una previsione),
    // restituiamo 2 punti: inizio periodo 50% → ora con probabilità corrente (mostra andamento).
    if (raw.length === 0) {
      const event = { ammState: eventMeta.ammState };
      if (event?.ammState) {
        const amm = event.ammState;
        const yesMicros = priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros);
        const currentYesPct = Math.round(Number((yesMicros * 100n) / SCALE) * 10) / 10;
        const points = [
          { t: from.toISOString(), yesPct: 50 },
          { t: now.toISOString(), yesPct: currentYesPct },
        ];
        return NextResponse.json({ points });
      }
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

    // Append current probability so the chart extends to "now" (AMM)
    const event = { ammState: eventMeta.ammState };
    if (event?.ammState) {
      const amm = event.ammState;
      const yesMicros = priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros);
      const currentYesPct = Number((yesMicros * 100n) / SCALE);
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
