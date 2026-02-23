/**
 * AMM trading engine: executeBuyShares, executeSellShares.
 * Uses FOR UPDATE locking, idempotency, and fixed-point LMSR only.
 *
 * Lock order (must be consistent everywhere; never reverse):
 * 1. AmmState (FOR UPDATE)
 * 2. User (FOR UPDATE)
 * 3. Position (FOR UPDATE)
 * Never update User before locking AmmState.
 */

import type { PrismaClient } from "@prisma/client";
import { buyGivenMaxCost, sellGivenShares } from "./fixedPointLmsr";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class AmmError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "MARKET_CLOSED"
      | "MARKET_RESOLVED"
      | "INSUFFICIENT_BALANCE"
      | "INSUFFICIENT_SHARES"
      | "USER_NOT_FOUND"
      | "AMM_STATE_NOT_FOUND"
      | "INVALID_OUTCOME"
      | "INVALID_AMOUNT"
  ) {
    super(message);
    this.name = "AmmError";
  }
}

export interface ExecuteBuySharesParams {
  eventId: string;
  userId: string;
  outcome: "YES" | "NO";
  maxCostMicros: bigint;
  idempotencyKey: string;
}

export interface ExecuteBuySharesResult {
  trade: { id: string; side: string; outcome: string; shareMicros: bigint; costMicros: bigint; createdAt: Date };
  position: { yesShareMicros: bigint; noShareMicros: bigint };
  actualCostMicros: bigint;
  shareMicros: bigint;
}

export interface ExecuteSellSharesParams {
  eventId: string;
  userId: string;
  outcome: "YES" | "NO";
  shareMicros: bigint;
  /** If set, throw if proceeds < minProceedsMicros (slippage guard). */
  minProceedsMicros?: bigint;
  idempotencyKey: string;
}

export interface ExecuteSellSharesResult {
  trade: { id: string; side: string; outcome: string; shareMicros: bigint; costMicros: bigint; createdAt: Date };
  position: { yesShareMicros: bigint; noShareMicros: bigint };
  proceedsMicros: bigint;
}

function lockAmmState(tx: Tx, eventId: string): Promise<unknown> {
  return (tx as any).$executeRaw`SELECT 1 FROM amm_state WHERE event_id = ${eventId} FOR UPDATE`;
}

function lockUser(tx: Tx, userId: string): Promise<unknown> {
  return (tx as any).$executeRaw`SELECT 1 FROM users WHERE id = ${userId} FOR UPDATE`;
}

function lockPosition(tx: Tx, eventId: string, userId: string): Promise<unknown> {
  return (tx as any).$executeRaw`SELECT 1 FROM positions WHERE event_id = ${eventId} AND user_id = ${userId} FOR UPDATE`;
}

/**
 * Execute buy shares. Call inside prisma.$transaction().
 * Lock order: AmmState -> User -> Position (create if not exists then lock).
 */
export async function executeBuyShares(
  tx: Tx,
  params: ExecuteBuySharesParams
): Promise<ExecuteBuySharesResult> {
  const { eventId, userId, outcome, maxCostMicros, idempotencyKey } = params;

  if (outcome !== "YES" && outcome !== "NO") throw new AmmError("Invalid outcome", "INVALID_OUTCOME");
  if (maxCostMicros <= 0n) throw new AmmError("maxCostMicros must be positive", "INVALID_AMOUNT");
  if (!idempotencyKey || idempotencyKey.trim() === "") throw new AmmError("idempotencyKey required", "INVALID_AMOUNT");

  const existingTrade = await tx.trade.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    select: { id: true, eventId: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true },
  });
  if (existingTrade && existingTrade.eventId === eventId) {
    const pos = await tx.position.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { yesShareMicros: true, noShareMicros: true },
    });
    return {
      trade: {
        id: existingTrade.id,
        side: existingTrade.side,
        outcome: existingTrade.outcome,
        shareMicros: existingTrade.shareMicros,
        costMicros: existingTrade.costMicros,
        createdAt: existingTrade.createdAt,
      },
      position: pos ? { yesShareMicros: pos.yesShareMicros, noShareMicros: pos.noShareMicros } : { yesShareMicros: 0n, noShareMicros: 0n },
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

  const amm = await tx.ammState.findUnique({ where: { eventId } });
  if (!amm) throw new AmmError("AMM state not found", "AMM_STATE_NOT_FOUND");

  await lockAmmState(tx, eventId);
  await lockUser(tx, userId);

  await tx.position.upsert({
    where: { eventId_userId: { eventId, userId } },
    create: { eventId, userId, yesShareMicros: 0n, noShareMicros: 0n },
    update: {},
  });
  await lockPosition(tx, eventId, userId);

  const user = await tx.user.findUnique({ where: { id: userId }, select: { creditsMicros: true } });
  if (!user) throw new AmmError("User not found", "USER_NOT_FOUND");

  const { shareMicros, actualCostMicros } = buyGivenMaxCost(
    amm.qYesMicros,
    amm.qNoMicros,
    amm.bMicros,
    outcome,
    maxCostMicros
  );

  if (user.creditsMicros < actualCostMicros) throw new AmmError("Insufficient balance", "INSUFFICIENT_BALANCE");

  const costMicrosForTrade = -actualCostMicros;

  let trade: { id: string; side: string; outcome: string; shareMicros: bigint; costMicros: bigint; createdAt: Date };
  try {
    trade = await tx.trade.create({
      data: {
        eventId,
        userId,
        side: "BUY",
        outcome,
        shareMicros,
        costMicros: costMicrosForTrade,
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
        const pos = await tx.position.findUnique({
          where: { eventId_userId: { eventId, userId } },
          select: { yesShareMicros: true, noShareMicros: true },
        });
        return {
          trade: {
            id: existing.id,
            side: existing.side,
            outcome: existing.outcome,
            shareMicros: existing.shareMicros,
            costMicros: existing.costMicros,
            createdAt: existing.createdAt,
          },
          position: pos ? { yesShareMicros: pos.yesShareMicros, noShareMicros: pos.noShareMicros } : { yesShareMicros: 0n, noShareMicros: 0n },
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

  const currentPosition = await tx.position.findUniqueOrThrow({
    where: { eventId_userId: { eventId, userId } },
    select: { yesShareMicros: true, noShareMicros: true },
  });
  if (outcome === "YES") {
    await tx.position.update({
      where: { eventId_userId: { eventId, userId } },
      data: { yesShareMicros: currentPosition.yesShareMicros + shareMicros },
    });
  } else {
    await tx.position.update({
      where: { eventId_userId: { eventId, userId } },
      data: { noShareMicros: currentPosition.noShareMicros + shareMicros },
    });
  }

  const currentAmm = await tx.ammState.findUniqueOrThrow({
    where: { eventId },
    select: { qYesMicros: true, qNoMicros: true },
  });
  await tx.ammState.update({
    where: { eventId },
    data: {
      qYesMicros: outcome === "YES" ? currentAmm.qYesMicros + shareMicros : currentAmm.qYesMicros,
      qNoMicros: outcome === "NO" ? currentAmm.qNoMicros + shareMicros : currentAmm.qNoMicros,
      version: { increment: 1 },
    },
  });

  const position = await tx.position.findUniqueOrThrow({
    where: { eventId_userId: { eventId, userId } },
    select: { yesShareMicros: true, noShareMicros: true },
  });

  return {
    trade: {
      id: trade.id,
      side: trade.side,
      outcome: trade.outcome,
      shareMicros: trade.shareMicros,
      costMicros: trade.costMicros,
      createdAt: trade.createdAt,
    },
    position: { yesShareMicros: position.yesShareMicros, noShareMicros: position.noShareMicros },
    actualCostMicros,
    shareMicros,
  };
}

/**
 * Execute sell shares. Call inside prisma.$transaction().
 */
export async function executeSellShares(
  tx: Tx,
  params: ExecuteSellSharesParams
): Promise<ExecuteSellSharesResult> {
  const { eventId, userId, outcome, shareMicros, minProceedsMicros, idempotencyKey } = params;

  if (outcome !== "YES" && outcome !== "NO") throw new AmmError("Invalid outcome", "INVALID_OUTCOME");
  if (shareMicros <= 0n) throw new AmmError("shareMicros must be positive", "INVALID_AMOUNT");
  if (!idempotencyKey || idempotencyKey.trim() === "") throw new AmmError("idempotencyKey required", "INVALID_AMOUNT");

  const existingTrade = await tx.trade.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    select: { id: true, eventId: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true },
  });
  if (existingTrade && existingTrade.eventId === eventId) {
    const pos = await tx.position.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { yesShareMicros: true, noShareMicros: true },
    });
    return {
      trade: {
        id: existingTrade.id,
        side: existingTrade.side,
        outcome: existingTrade.outcome,
        shareMicros: existingTrade.shareMicros,
        costMicros: existingTrade.costMicros,
        createdAt: existingTrade.createdAt,
      },
      position: pos ? { yesShareMicros: pos.yesShareMicros, noShareMicros: pos.noShareMicros } : { yesShareMicros: 0n, noShareMicros: 0n },
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

  const amm = await tx.ammState.findUnique({ where: { eventId } });
  if (!amm) throw new AmmError("AMM state not found", "AMM_STATE_NOT_FOUND");

  await lockAmmState(tx, eventId);
  await lockUser(tx, userId);

  const positionRow = await tx.position.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { yesShareMicros: true, noShareMicros: true },
  });
  if (!positionRow) throw new AmmError("No position to sell", "INSUFFICIENT_SHARES");

  const held = outcome === "YES" ? positionRow.yesShareMicros : positionRow.noShareMicros;
  if (held < shareMicros) throw new AmmError("Insufficient shares", "INSUFFICIENT_SHARES");

  await lockPosition(tx, eventId, userId);

  const proceedsMicros = sellGivenShares(
    amm.qYesMicros,
    amm.qNoMicros,
    amm.bMicros,
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
        const pos = await tx.position.findUnique({
          where: { eventId_userId: { eventId, userId } },
          select: { yesShareMicros: true, noShareMicros: true },
        });
        return {
          trade: {
            id: existing.id,
            side: existing.side,
            outcome: existing.outcome,
            shareMicros: existing.shareMicros,
            costMicros: existing.costMicros,
            createdAt: existing.createdAt,
          },
          position: pos ? { yesShareMicros: pos.yesShareMicros, noShareMicros: pos.noShareMicros } : { yesShareMicros: 0n, noShareMicros: 0n },
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

  if (outcome === "YES") {
    await tx.position.update({
      where: { eventId_userId: { eventId, userId } },
      data: { yesShareMicros: positionRow.yesShareMicros - shareMicros },
    });
  } else {
    await tx.position.update({
      where: { eventId_userId: { eventId, userId } },
      data: { noShareMicros: positionRow.noShareMicros - shareMicros },
    });
  }

  const currentAmmSell = await tx.ammState.findUniqueOrThrow({
    where: { eventId },
    select: { qYesMicros: true, qNoMicros: true },
  });
  await tx.ammState.update({
    where: { eventId },
    data: {
      qYesMicros: outcome === "YES" ? currentAmmSell.qYesMicros - shareMicros : currentAmmSell.qYesMicros,
      qNoMicros: outcome === "NO" ? currentAmmSell.qNoMicros - shareMicros : currentAmmSell.qNoMicros,
      version: { increment: 1 },
    },
  });

  const position = await tx.position.findUniqueOrThrow({
    where: { eventId_userId: { eventId, userId } },
    select: { yesShareMicros: true, noShareMicros: true },
  });

  return {
    trade: {
      id: trade.id,
      side: trade.side,
      outcome: trade.outcome,
      shareMicros: trade.shareMicros,
      costMicros: trade.costMicros,
      createdAt: trade.createdAt,
    },
    position: { yesShareMicros: position.yesShareMicros, noShareMicros: position.noShareMicros },
    proceedsMicros,
  };
}
