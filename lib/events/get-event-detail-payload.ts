import { prisma } from "@/lib/prisma";
import { setCachedPrice } from "@/lib/cache/price";
import { DEFAULT_B } from "@/lib/pricing/initialization";
import { priceYesMicros, pricesByOutcomeMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import {
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  parseOutcomesJson,
} from "@/lib/market-types";
import { getEventMarketSharesByOutcome } from "@/lib/amm/multi-outcome-engine";

/** Stesso payload di GET /api/events/[id], serializzabile per RSC → client. */
export type EventDetailApiPayload = {
  event: Record<string, unknown>;
  userPrediction: null;
  userPosition: {
    yesShareMicros: string;
    noShareMicros: string;
    positionCostMicros?: string;
    positionYesCostMicros?: string;
    positionNoCostMicros?: string;
    outcomeSharesMicros?: Record<string, string>;
    outcomeCostMicros?: Record<string, string>;
  } | null;
  tradeHistory: Array<{
    id: string;
    side: string;
    outcome: string;
    shareMicros: string;
    costMicros: string;
    createdAt: string;
    realizedPlMicros: string | null;
  }>;
  isFollowing: boolean;
};

export async function getEventDetailPayload(
  eventId: string,
  sessionUserId: string | undefined
): Promise<EventDetailApiPayload | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          Prediction: true,
          Trade: true,
          comments: true,
        },
      },
    },
  });

  if (!event) return null;

  const marketType = event.marketType ?? "BINARY";
  const isMultiOutcomeMarket =
    isMarketTypeId(marketType) &&
    MULTI_OPTION_MARKET_TYPES.includes(marketType);
  const outcomeOptions = parseOutcomesJson(event.outcomes) ?? [];
  const amm = !isMultiOutcomeMarket
    ? await prisma.ammState.findUnique({ where: { eventId: event.id } })
    : null;
  let probability = 50;
  let outcomeProbabilities:
    | Array<{ key: string; label: string; probabilityPct: number }>
    | null = null;
  if (amm) {
    try {
      const yesMicros = priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros);
      probability = Number((yesMicros * 100n) / SCALE);
    } catch (ammError) {
      console.warn("AMM state invalid for event", event.id, ammError);
      probability = 50;
    }
  } else if (isMultiOutcomeMarket && outcomeOptions.length > 0) {
    try {
      const outcomeKeys = outcomeOptions.map((o) => o.key);
      const qByOutcome = await getEventMarketSharesByOutcome(prisma, event.id, outcomeKeys);
      const bMicros = BigInt(Math.max(1, Math.round((event.b ?? 1) * 1_000_000)));
      const prices = pricesByOutcomeMicros(outcomeKeys, qByOutcome, bMicros);
      outcomeProbabilities = outcomeOptions.map((opt) => ({
        key: opt.key,
        label: opt.label,
        probabilityPct: Number((prices[opt.key] * 100n) / SCALE),
      }));
    } catch (multiErr) {
      console.warn("Multi-outcome price computation failed", event.id, multiErr);
      outcomeProbabilities = outcomeOptions.map((opt) => ({
        key: opt.key,
        label: opt.label,
        probabilityPct: Math.round(100 / Math.max(1, outcomeOptions.length)),
      }));
    }
  }
  setCachedPrice(eventId, { eventId: event.id, probability, q_yes: 0, q_no: 0, b: DEFAULT_B }).catch(() => {});
  (event as { probability?: number }).probability = probability;

  let userPosition: EventDetailApiPayload["userPosition"] = null;
  let tradeHistory: EventDetailApiPayload["tradeHistory"] = [];
  let isFollowing = false;

  if (sessionUserId) {
    const [follow, position, costBySide, history] = await Promise.all([
      prisma.eventFollower.findUnique({
        where: {
          userId_eventId: { userId: sessionUserId, eventId: event.id },
        },
      }),
      prisma.position.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: sessionUserId } },
        select: { yesShareMicros: true, noShareMicros: true },
      }),
      prisma.trade
        .findMany({
          where: {
            eventId: event.id,
            userId: sessionUserId,
            side: "BUY",
          },
          select: { costMicros: true, outcome: true },
        })
        .then((trades) => {
          let yesCost = 0n;
          let noCost = 0n;
          for (const t of trades) {
            const abs = t.costMicros < 0n ? -t.costMicros : t.costMicros;
            if (t.outcome === "YES") yesCost += abs;
            else if (t.outcome === "NO") noCost += abs;
          }
          return { yesCost, noCost };
        }),
      prisma.trade.findMany({
        where: { eventId: event.id, userId: sessionUserId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          side: true,
          outcome: true,
          shareMicros: true,
          costMicros: true,
          createdAt: true,
          realizedPlMicros: true,
        },
      }),
    ]);
    isFollowing = !!follow;
    tradeHistory = history.map((t) => ({
      id: t.id,
      side: t.side,
      outcome: t.outcome,
      shareMicros: t.shareMicros.toString(),
      costMicros: t.costMicros.toString(),
      createdAt: t.createdAt.toISOString(),
      realizedPlMicros: t.realizedPlMicros != null ? t.realizedPlMicros.toString() : null,
    }));

    let remainingYesCostMicros = costBySide.yesCost;
    let remainingNoCostMicros = costBySide.noCost;
    const remainingCostByOutcome = new Map<string, bigint>();
    const sharesByOutcome = new Map<string, bigint>();
    for (const t of history) {
      const outcomeKey = t.outcome;
      if (!remainingCostByOutcome.has(outcomeKey)) remainingCostByOutcome.set(outcomeKey, 0n);
      if (!sharesByOutcome.has(outcomeKey)) sharesByOutcome.set(outcomeKey, 0n);
      if (t.side === "BUY") {
        const abs = t.costMicros < 0n ? -t.costMicros : t.costMicros;
        remainingCostByOutcome.set(outcomeKey, (remainingCostByOutcome.get(outcomeKey) ?? 0n) + abs);
        sharesByOutcome.set(outcomeKey, (sharesByOutcome.get(outcomeKey) ?? 0n) + t.shareMicros);
      } else if (t.side === "SELL") {
        sharesByOutcome.set(outcomeKey, (sharesByOutcome.get(outcomeKey) ?? 0n) - t.shareMicros);
      }
    }
    for (const t of history) {
      if (t.side !== "SELL" || t.realizedPlMicros == null) continue;
      const proceedsMicros = t.costMicros > 0n ? t.costMicros : -t.costMicros;
      const costBasisUsedMicros = proceedsMicros - t.realizedPlMicros;
      if (t.outcome === "YES") {
        remainingYesCostMicros =
          remainingYesCostMicros - costBasisUsedMicros > 0n
            ? remainingYesCostMicros - costBasisUsedMicros
            : 0n;
      } else {
        remainingNoCostMicros =
          remainingNoCostMicros - costBasisUsedMicros > 0n
            ? remainingNoCostMicros - costBasisUsedMicros
            : 0n;
      }
      const curr = remainingCostByOutcome.get(t.outcome) ?? 0n;
      remainingCostByOutcome.set(
        t.outcome,
        curr - costBasisUsedMicros > 0n ? curr - costBasisUsedMicros : 0n
      );
    }
    const totalRemainingCostMicros = remainingYesCostMicros + remainingNoCostMicros;

    if (position) {
      userPosition = {
        yesShareMicros: position.yesShareMicros.toString(),
        noShareMicros: position.noShareMicros.toString(),
        positionCostMicros: totalRemainingCostMicros.toString(),
        positionYesCostMicros: remainingYesCostMicros.toString(),
        positionNoCostMicros: remainingNoCostMicros.toString(),
      };
    } else if (isMultiOutcomeMarket) {
      const outcomeSharesMicros = Object.fromEntries(
        [...sharesByOutcome.entries()].map(([k, v]) => [k, v > 0n ? v.toString() : "0"])
      );
      const outcomeCostMicros = Object.fromEntries(
        [...remainingCostByOutcome.entries()].map(([k, v]) => [k, v > 0n ? v.toString() : "0"])
      );
      userPosition = {
        yesShareMicros: "0",
        noShareMicros: "0",
        positionCostMicros: "0",
        positionYesCostMicros: "0",
        positionNoCostMicros: "0",
        outcomeSharesMicros,
        outcomeCostMicros,
      };
    }
  }

  const { _count, ...eventRest } = event;
  const predictionsCount = (_count.Prediction ?? 0) + ((_count as { Trade?: number }).Trade ?? 0);
  const eventForClient = {
    ...eventRest,
    outcomeProbabilities,
    _count: { predictions: predictionsCount, comments: _count.comments },
  };

  const payload: EventDetailApiPayload = {
    event: eventForClient as unknown as Record<string, unknown>,
    userPrediction: null,
    userPosition,
    tradeHistory,
    isFollowing,
  };

  return JSON.parse(JSON.stringify(payload)) as EventDetailApiPayload;
}
