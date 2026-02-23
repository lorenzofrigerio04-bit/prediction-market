/**
 * AMM market resolution: two-phase (mark resolved + batched payouts).
 * Does not touch Prediction or Event.q_yes/q_no.
 * Payouts are idempotent: running payoutMarketInBatches twice does not double pay.
 */

import type { PrismaClient } from "@prisma/client";

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Phase A: Mark event resolved. Short transaction, lock order: Event -> AmmState.
 */
export async function resolveMarketMarkResolved(
  tx: Tx,
  eventId: string,
  outcome: "YES" | "NO"
): Promise<void> {
  const event = await tx.event.findUnique({
    where: { id: eventId },
    select: { resolved: true, tradingMode: true },
  });
  if (!event) throw new Error("Event not found");
  if (event.tradingMode !== "AMM") throw new Error("Event is not AMM");
  if (event.resolved) throw new Error("Event already resolved");

  await (tx as any).$executeRaw`SELECT 1 FROM events WHERE id = ${eventId} FOR UPDATE`;
  const amm = await tx.ammState.findUnique({ where: { eventId } });
  if (amm) await (tx as any).$executeRaw`SELECT 1 FROM amm_state WHERE event_id = ${eventId} FOR UPDATE`;

  await tx.event.update({
    where: { id: eventId },
    data: { resolved: true, outcome, resolvedAt: new Date() },
  });
}

/**
 * Phase B: Pay out positions in batches. Idempotent: checks for existing SHARE_PAYOUT
 * transaction per user/event before paying.
 */
export async function payoutMarketInBatches(
  prisma: PrismaClient,
  eventId: string,
  outcome: "YES" | "NO",
  batchSize: number = 500
): Promise<{ paidCount: number; paidUserIds: string[] }> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { outcome: true, resolved: true, tradingMode: true },
  });
  if (!event || event.tradingMode !== "AMM" || !event.resolved || event.outcome !== outcome) {
    throw new Error("Event not resolved or outcome mismatch");
  }

  let paidCount = 0;
  const paidUserIds: string[] = [];
  let cursor: string | undefined;

  for (;;) {
    const positions = await prisma.position.findMany({
      where: { eventId },
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, userId: true, yesShareMicros: true, noShareMicros: true },
    });
    if (positions.length === 0) break;

    await prisma.$transaction(async (tx) => {
      for (const pos of positions) {
        const winningShareMicros = outcome === "YES" ? pos.yesShareMicros : pos.noShareMicros;
        if (winningShareMicros <= 0n) continue;

        const existing = await tx.transaction.findFirst({
          where: {
            userId: pos.userId,
            type: "SHARE_PAYOUT",
            referenceId: eventId,
          },
        });
        if (existing) continue;

        await tx.transaction.create({
          data: {
            userId: pos.userId,
            type: "SHARE_PAYOUT",
            amount: 0,
            amountMicros: winningShareMicros,
            referenceId: eventId,
            referenceType: "event",
          },
        });
        await tx.user.update({
          where: { id: pos.userId },
          data: { creditsMicros: { increment: winningShareMicros } },
        });
        paidCount += 1;
        paidUserIds.push(pos.userId);
      }
    });

    cursor = positions[positions.length - 1]?.id;
    if (positions.length < batchSize) break;
  }

  return { paidCount, paidUserIds };
}
