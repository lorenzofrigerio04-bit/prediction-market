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
 * - binary: YES/NO percentage (reconstructed from trades)
 * - multi-outcome: probability by outcome key (reconstructed from trades)
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
    const bMicros = BigInt(Math.max(1, Math.round((eventMeta.b ?? 1) * 1_000_000)));

    if (isMultiOutcomeMarket && outcomeOptions.length >= 2) {
      const outcomeKeys = outcomeOptions.map((o) => o.key);
      const tradesBeforeRange = await prisma.trade.findMany({
        where: { eventId, createdAt: { lt: from } },
        orderBy: { createdAt: "asc" },
        select: { outcome: true, side: true, shareMicros: true, createdAt: true },
      });
      const tradesInRange = await prisma.trade.findMany({
        where: { eventId, createdAt: { gte: from, lte: now } },
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
          pctByOutcome[key] = Math.round((Number(prices[key]) * 100 / Number(SCALE)) * 10) / 10;
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

    // Binary: replay trades to reconstruct YES% over time
    const binaryTradesBefore = await prisma.trade.findMany({
      where: { eventId, createdAt: { lt: from } },
      orderBy: { createdAt: "asc" },
      select: { outcome: true, side: true, shareMicros: true, createdAt: true },
    });
    const binaryTradesInRange = await prisma.trade.findMany({
      where: { eventId, createdAt: { gte: from, lte: now } },
      orderBy: { createdAt: "asc" },
      select: { outcome: true, side: true, shareMicros: true, createdAt: true },
    });

    let qYes = 0n;
    let qNo = 0n;

    const applyBinaryTrade = (trade: { outcome: string; side: string; shareMicros: bigint }) => {
      const delta = trade.side === "BUY" ? trade.shareMicros : -trade.shareMicros;
      if (trade.outcome === "YES") {
        const next = qYes + delta;
        qYes = next > 0n ? next : 0n;
      } else {
        const next = qNo + delta;
        qNo = next > 0n ? next : 0n;
      }
    };

    for (const trade of binaryTradesBefore) applyBinaryTrade(trade);

    const computeYesPct = (): number => {
      const yesMicros = priceYesMicros(qYes, qNo, bMicros);
      return Math.round((Number(yesMicros) * 100 / Number(SCALE)) * 10) / 10;
    };

    const rawPoints: Array<{ t: Date; yesPct: number }> = [
      { t: from, yesPct: computeYesPct() },
    ];

    for (const trade of binaryTradesInRange) {
      applyBinaryTrade(trade);
      rawPoints.push({ t: trade.createdAt, yesPct: computeYesPct() });
    }

    const bucketMs = Math.max(Math.floor(rangeMs / MAX_POINTS), 60 * 1000);
    const buckets = new Map<number, { t: Date; yesPct: number }>();
    for (const row of rawPoints) {
      const bucket = Math.floor(row.t.getTime() / bucketMs) * bucketMs;
      buckets.set(bucket, row);
    }

    let points = Array.from(buckets.values())
      .sort((a, b) => a.t.getTime() - b.t.getTime())
      .map(({ t, yesPct }) => ({
        t: t.toISOString(),
        yesPct,
      }));

    if (points.length === 0) {
      points = [{ t: from.toISOString(), yesPct: computeYesPct() }];
    }

    // Append current live AMM state so the chart extends to "now"
    const lastT = new Date(points[points.length - 1].t).getTime();
    if (now.getTime() - lastT > 60 * 1000) {
      if (eventMeta.ammState) {
        const amm = eventMeta.ammState;
        const liveYesMicros = priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros);
        const liveYesPct = Math.round((Number(liveYesMicros) * 100 / Number(SCALE)) * 10) / 10;
        points.push({ t: now.toISOString(), yesPct: liveYesPct });
      } else {
        points.push({ t: now.toISOString(), yesPct: computeYesPct() });
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
