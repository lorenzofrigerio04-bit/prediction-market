import type { PrismaClient } from "@prisma/client";
import { AmmError } from "./engine";
import {
  buyGivenMaxCostMultiOutcome,
  SCALE,
  sellGivenSharesMultiOutcome,
} from "./fixedPointLmsr";
import {
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  parseOutcomesJson,
} from "@/lib/market-types";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type OutcomeMap = Record<string, bigint>;

export interface ExecuteBuyMultiOutcomeParams {
  eventId: string;
  userId: string;
  outcome: string;
  maxCostMicros: bigint;
  idempotencyKey: string;
}

export interface ExecuteBuyMultiOutcomeResult {
  trade: { id: string; side: string; outcome: string; shareMicros: bigint; costMicros: bigint; createdAt: Date };
  positionByOutcomeMicros: OutcomeMap;
  actualCostMicros: bigint;
  shareMicros: bigint;
}

export interface ExecuteSellMultiOutcomeParams {
  eventId: string;
  userId: string;
  outcome: string;
  shareMicros: bigint;
  minProceedsMicros?: bigint;
  idempotencyKey: string;
}

export interface ExecuteSellMultiOutcomeResult {
  trade: { id: string; side: string; outcome: string; shareMicros: bigint; costMicros: bigint; createdAt: Date };
  positionByOutcomeMicros: OutcomeMap;
  proceedsMicros: bigint;
}

function toBMicros(eventB: number | null | undefined): bigint {
  const b = typeof eventB === "number" && Number.isFinite(eventB) ? eventB : 0;
  const micros = Math.max(1, Math.round(b * Number(SCALE)));
  return BigInt(micros);
}

function normalizeOutcomeMap(keys: string[], map: OutcomeMap): OutcomeMap {
  const out: OutcomeMap = {};
  for (const key of keys) out[key] = map[key] ?? 0n;
  return out;
}

async function getEventMultiOutcomeConfig(tx: Tx, eventId: string): Promise<{
  outcomeKeys: string[];
  bMicros: bigint;
}> {
  const event = await tx.event.findUnique({
    where: { id: eventId },
    select: {
      marketType: true,
      outcomes: true,
      b: true,
    },
  });
  if (!event) throw new AmmError("Event not found", "MARKET_CLOSED");
  const marketType = event.marketType ?? "BINARY";
  if (!isMarketTypeId(marketType) || !MULTI_OPTION_MARKET_TYPES.includes(marketType)) {
    throw new AmmError("Event is not a multi-outcome market", "INVALID_OUTCOME");
  }
  const outcomes = parseOutcomesJson(event.outcomes) ?? [];
  if (outcomes.length < 2) {
    throw new AmmError("Market outcomes missing or invalid", "INVALID_OUTCOME");
  }
  return {
    outcomeKeys: outcomes.map((o) => o.key),
    bMicros: toBMicros(event.b),
  };
}

async function aggregateNetSharesByOutcome(
  tx: Tx,
  eventId: string,
  outcomeKeys: string[],
  userId?: string
): Promise<OutcomeMap> {
  const whereBase = { eventId, ...(userId ? { userId } : {}) };
  const [buys, sells] = await Promise.all([
    tx.trade.groupBy({
      by: ["outcome"],
      where: { ...whereBase, side: "BUY" },
      _sum: { shareMicros: true },
    }),
    tx.trade.groupBy({
      by: ["outcome"],
      where: { ...whereBase, side: "SELL" },
      _sum: { shareMicros: true },
    }),
  ]);

  const out: OutcomeMap = {};
  for (const k of outcomeKeys) out[k] = 0n;
  for (const row of buys) {
    if (!(row.outcome in out)) continue;
    out[row.outcome] = out[row.outcome] + (row._sum.shareMicros ?? 0n);
  }
  for (const row of sells) {
    if (!(row.outcome in out)) continue;
    out[row.outcome] = out[row.outcome] - (row._sum.shareMicros ?? 0n);
  }
  for (const k of outcomeKeys) {
    if (out[k] < 0n) out[k] = 0n;
  }
  return out;
}

async function lockEvent(tx: Tx, eventId: string): Promise<void> {
  await (tx as unknown as { $executeRaw: (...args: unknown[]) => Promise<unknown> })
    .$executeRaw`SELECT 1 FROM events WHERE id = ${eventId} FOR UPDATE`;
}

async function lockUser(tx: Tx, userId: string): Promise<void> {
  await (tx as unknown as { $executeRaw: (...args: unknown[]) => Promise<unknown> })
    .$executeRaw`SELECT 1 FROM users WHERE id = ${userId} FOR UPDATE`;
}

export async function executeBuySharesMultiOutcome(
  tx: Tx,
  params: ExecuteBuyMultiOutcomeParams
): Promise<ExecuteBuyMultiOutcomeResult> {
  const { eventId, userId, outcome, maxCostMicros, idempotencyKey } = params;
  if (!outcome?.trim()) throw new AmmError("Invalid outcome", "INVALID_OUTCOME");
  if (maxCostMicros <= 0n) throw new AmmError("maxCostMicros must be positive", "INVALID_AMOUNT");
  if (!idempotencyKey?.trim()) throw new AmmError("idempotencyKey required", "INVALID_AMOUNT");

  const existingTrade = await tx.trade.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    select: { id: true, eventId: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true },
  });
  if (existingTrade && existingTrade.eventId === eventId) {
    const { outcomeKeys } = await getEventMultiOutcomeConfig(tx, eventId);
    const positionByOutcomeMicros = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys, userId);
    return {
      trade: existingTrade,
      positionByOutcomeMicros,
      actualCostMicros: existingTrade.costMicros < 0n ? -existingTrade.costMicros : existingTrade.costMicros,
      shareMicros: existingTrade.shareMicros,
    };
  }

  const event = await tx.event.findUnique({
    where: { id: eventId },
    select: { resolved: true, closesAt: true, tradingMode: true },
  });
  if (!event) throw new AmmError("Event not found", "MARKET_CLOSED");
  if (event.tradingMode !== "AMM") throw new AmmError("Event is not AMM", "MARKET_CLOSED");
  if (event.resolved) throw new AmmError("Market resolved", "MARKET_RESOLVED");
  if (new Date(event.closesAt) <= new Date()) throw new AmmError("Market closed", "MARKET_CLOSED");

  const { outcomeKeys, bMicros } = await getEventMultiOutcomeConfig(tx, eventId);
  if (!outcomeKeys.includes(outcome)) throw new AmmError("Invalid outcome", "INVALID_OUTCOME");

  await lockEvent(tx, eventId);
  await lockUser(tx, userId);

  const user = await tx.user.findUnique({ where: { id: userId }, select: { creditsMicros: true } });
  if (!user) throw new AmmError("User not found", "USER_NOT_FOUND");

  const marketQ = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys);
  const normalizedQ = normalizeOutcomeMap(outcomeKeys, marketQ);
  const { shareMicros, actualCostMicros } = buyGivenMaxCostMultiOutcome(
    outcomeKeys,
    normalizedQ,
    bMicros,
    outcome,
    maxCostMicros
  );
  if (actualCostMicros <= 0n || shareMicros <= 0n) {
    throw new AmmError("Invalid amount", "INVALID_AMOUNT");
  }
  if (user.creditsMicros < actualCostMicros) {
    throw new AmmError("Insufficient balance", "INSUFFICIENT_BALANCE");
  }

  let trade: { id: string; side: string; outcome: string; shareMicros: bigint; costMicros: bigint; createdAt: Date };
  try {
    trade = await tx.trade.create({
      data: {
        eventId,
        userId,
        side: "BUY",
        outcome,
        shareMicros,
        costMicros: -actualCostMicros,
        idempotencyKey,
      },
      select: { id: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true },
    });
  } catch (e: unknown) {
    const prismaError = e as { code?: string };
    if (prismaError?.code === "P2002") {
      const existing = await tx.trade.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        select: { id: true, eventId: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true },
      });
      if (existing && existing.eventId === eventId) {
        const positionByOutcomeMicros = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys, userId);
        return {
          trade: existing,
          positionByOutcomeMicros,
          actualCostMicros: existing.costMicros < 0n ? -existing.costMicros : existing.costMicros,
          shareMicros: existing.shareMicros,
        };
      }
    }
    throw e;
  }

  await tx.transaction.create({
    data: {
      userId,
      type: "SHARE_BUY",
      amount: 0,
      amountMicros: -actualCostMicros,
      referenceId: trade.id,
      referenceType: "trade",
    },
  });
  await tx.user.update({
    where: { id: userId },
    data: { creditsMicros: { decrement: actualCostMicros } },
  });
  const creditsToAdd = Math.floor(Number(actualCostMicros) / Number(SCALE));
  if (creditsToAdd > 0) {
    await tx.event.update({
      where: { id: eventId },
      data: { totalCredits: { increment: creditsToAdd } },
    });
  }

  const positionByOutcomeMicros = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys, userId);
  return {
    trade,
    positionByOutcomeMicros,
    actualCostMicros,
    shareMicros,
  };
}

export async function executeSellSharesMultiOutcome(
  tx: Tx,
  params: ExecuteSellMultiOutcomeParams
): Promise<ExecuteSellMultiOutcomeResult> {
  const { eventId, userId, outcome, shareMicros, minProceedsMicros, idempotencyKey } = params;
  if (!outcome?.trim()) throw new AmmError("Invalid outcome", "INVALID_OUTCOME");
  if (shareMicros <= 0n) throw new AmmError("shareMicros must be positive", "INVALID_AMOUNT");
  if (!idempotencyKey?.trim()) throw new AmmError("idempotencyKey required", "INVALID_AMOUNT");

  const existingTrade = await tx.trade.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    select: { id: true, eventId: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true },
  });
  if (existingTrade && existingTrade.eventId === eventId) {
    const { outcomeKeys } = await getEventMultiOutcomeConfig(tx, eventId);
    const positionByOutcomeMicros = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys, userId);
    return {
      trade: existingTrade,
      positionByOutcomeMicros,
      proceedsMicros: existingTrade.costMicros > 0n ? existingTrade.costMicros : 0n,
    };
  }

  const event = await tx.event.findUnique({
    where: { id: eventId },
    select: { resolved: true, closesAt: true, tradingMode: true },
  });
  if (!event) throw new AmmError("Event not found", "MARKET_CLOSED");
  if (event.tradingMode !== "AMM") throw new AmmError("Event is not AMM", "MARKET_CLOSED");
  if (event.resolved) throw new AmmError("Market resolved", "MARKET_RESOLVED");
  if (new Date(event.closesAt) <= new Date()) throw new AmmError("Market closed", "MARKET_CLOSED");

  const { outcomeKeys, bMicros } = await getEventMultiOutcomeConfig(tx, eventId);
  if (!outcomeKeys.includes(outcome)) throw new AmmError("Invalid outcome", "INVALID_OUTCOME");

  await lockEvent(tx, eventId);
  await lockUser(tx, userId);

  const userPos = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys, userId);
  const held = userPos[outcome] ?? 0n;
  if (held < shareMicros) throw new AmmError("Insufficient shares", "INSUFFICIENT_SHARES");

  const marketQ = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys);
  const proceedsMicros = sellGivenSharesMultiOutcome(
    outcomeKeys,
    normalizeOutcomeMap(outcomeKeys, marketQ),
    bMicros,
    outcome,
    shareMicros
  );
  if (minProceedsMicros != null && proceedsMicros < minProceedsMicros) {
    throw new AmmError("Proceeds below minimum (slippage)", "INVALID_AMOUNT");
  }

  let trade: { id: string; side: string; outcome: string; shareMicros: bigint; costMicros: bigint; createdAt: Date };
  try {
    trade = await tx.trade.create({
      data: {
        eventId,
        userId,
        side: "SELL",
        outcome,
        shareMicros,
        costMicros: proceedsMicros,
        idempotencyKey,
      },
      select: { id: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true },
    });
  } catch (e: unknown) {
    const prismaError = e as { code?: string };
    if (prismaError?.code === "P2002") {
      const existing = await tx.trade.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        select: { id: true, eventId: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true },
      });
      if (existing && existing.eventId === eventId) {
        const positionByOutcomeMicros = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys, userId);
        return {
          trade: existing,
          positionByOutcomeMicros,
          proceedsMicros: existing.costMicros > 0n ? existing.costMicros : 0n,
        };
      }
    }
    throw e;
  }
  await tx.transaction.create({
    data: {
      userId,
      type: "SHARE_SELL",
      amount: 0,
      amountMicros: proceedsMicros,
      referenceId: trade.id,
      referenceType: "trade",
    },
  });
  await tx.user.update({
    where: { id: userId },
    data: { creditsMicros: { increment: proceedsMicros } },
  });

  const positionByOutcomeMicros = await aggregateNetSharesByOutcome(tx, eventId, outcomeKeys, userId);
  return {
    trade,
    positionByOutcomeMicros,
    proceedsMicros,
  };
}

export async function getEventMarketSharesByOutcome(
  prisma: PrismaClient,
  eventId: string,
  outcomeKeys: string[]
): Promise<OutcomeMap> {
  return aggregateNetSharesByOutcome(prisma as unknown as Tx, eventId, outcomeKeys);
}

export async function getUserPositionByOutcome(
  prisma: PrismaClient,
  eventId: string,
  userId: string,
  outcomeKeys: string[]
): Promise<OutcomeMap> {
  return aggregateNetSharesByOutcome(prisma as unknown as Tx, eventId, outcomeKeys, userId);
}

