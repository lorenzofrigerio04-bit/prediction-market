/**
 * Integration tests for AMM engine ledger and resolve.
 * Run with DATABASE_URL set (e.g. test DB). Skip when no DB.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { executeBuyShares, executeSellShares } from "../engine";
import { resolveMarketMarkResolved, payoutMarketInBatches } from "../resolve";

const SKIP = !process.env.DATABASE_URL || process.env.RUN_AMM_INTEGRATION !== "1";

describe.skipIf(SKIP)("AMM engine ledger and resolve integration", () => {
  let eventId: string;
  let userId1: string;
  let userId2: string;
  const idempotencyKey1 = `test-idem-${Date.now()}-1`;
  const idempotencyKey2 = `test-idem-${Date.now()}-2`;

  beforeAll(async () => {
    const user1 = await prisma.user.create({
      data: {
        email: `amm-test-1-${Date.now()}@test.local`,
        name: "AMM Test 1",
        credits: 0,
        creditsMicros: 10_000_000n * 1_000_000n,
      },
    });
    const user2 = await prisma.user.create({
      data: {
        email: `amm-test-2-${Date.now()}@test.local`,
        name: "AMM Test 2",
        credits: 0,
        creditsMicros: 10_000_000n * 1_000_000n,
      },
    });
    userId1 = user1.id;
    userId2 = user2.id;

    const event = await prisma.event.create({
      data: {
        title: "AMM integration test event",
        category: "Test",
        closesAt: new Date(Date.now() + 86400_000),
        createdById: user1.id,
        status: "OPEN",
        resolved: false,
        tradingMode: "AMM",
        b: 100,
        dedupKey: `amm-integration-${Date.now()}`,
      },
    });
    eventId = event.id;

    await prisma.ammState.create({
      data: {
        eventId,
        qYesMicros: 0n,
        qNoMicros: 0n,
        bMicros: 100n * 1_000_000n,
      },
    });
  });

  afterAll(async () => {
    if (!eventId) return;
    if (userId1) await prisma.transaction.deleteMany({ where: { userId: userId1 } });
    if (userId2) await prisma.transaction.deleteMany({ where: { userId: userId2 } });
    await prisma.trade.deleteMany({ where: { eventId } });
    await prisma.position.deleteMany({ where: { eventId } });
    await prisma.ammState.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { id: eventId } });
    if (userId1) await prisma.user.deleteMany({ where: { id: userId1 } });
    if (userId2) await prisma.user.deleteMany({ where: { id: userId2 } });
  });

  it("BUY writes SHARE_BUY transaction", async () => {
    await prisma.$transaction((tx) =>
      executeBuyShares(tx, {
        eventId,
        userId: userId1,
        outcome: "YES",
        maxCostMicros: 1_000_000n,
        idempotencyKey: idempotencyKey1,
      })
    );
    const tx = await prisma.transaction.findFirst({
      where: { userId: userId1, type: "SHARE_BUY" },
      orderBy: { createdAt: "desc" },
    });
    expect(tx).toBeDefined();
    expect(tx?.amountMicros).toBeLessThan(0n);
    expect(tx?.referenceType).toBe("trade");
  });

  it("two parallel BUY with same idempotencyKey return same trade id", async () => {
    const key = `race-${Date.now()}`;
    const [r1, r2] = await Promise.all([
      prisma.$transaction((tx) =>
        executeBuyShares(tx, {
          eventId,
          userId: userId2,
          outcome: "NO",
          maxCostMicros: 500_000n,
          idempotencyKey: key,
        })
      ),
      prisma.$transaction((tx) =>
        executeBuyShares(tx, {
          eventId,
          userId: userId2,
          outcome: "NO",
          maxCostMicros: 500_000n,
          idempotencyKey: key,
        })
      ),
    ]);
    expect(r1.trade.id).toBe(r2.trade.id);
    const count = await prisma.trade.count({
      where: { userId: userId2, idempotencyKey: key },
    });
    expect(count).toBe(1);
  });

  it("SELL after BUY writes SHARE_SELL transaction", async () => {
    const pos = await prisma.position.findUnique({
      where: { eventId_userId: { eventId, userId: userId1 } },
    });
    if (!pos || pos.yesShareMicros === 0n) return;
    const shareMicros = pos.yesShareMicros / 2n || 1n;
    await prisma.$transaction((tx) =>
      executeSellShares(tx, {
        eventId,
        userId: userId1,
        outcome: "YES",
        shareMicros,
        idempotencyKey: `sell-${Date.now()}`,
      })
    );
    const tx = await prisma.transaction.findFirst({
      where: { userId: userId1, type: "SHARE_SELL" },
      orderBy: { createdAt: "desc" },
    });
    expect(tx).toBeDefined();
    expect(tx?.amountMicros).toBeGreaterThan(0n);
    expect(tx?.referenceType).toBe("trade");
  });

  it("resolve markResolved + payoutMarketInBatches writes SHARE_PAYOUT; running payouts twice does not double pay", async () => {
    await prisma.$transaction((tx) =>
      resolveMarketMarkResolved(tx, eventId, "YES")
    );
    const { paidCount: first, paidUserIds } = await payoutMarketInBatches(prisma, eventId, "YES", 500);
    const { paidCount: second } = await payoutMarketInBatches(prisma, eventId, "YES", 500);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(second).toBe(0);
    const payoutsCount = await prisma.transaction.count({
      where: { type: "SHARE_PAYOUT", referenceId: eventId },
    });
    expect(payoutsCount).toBe(paidUserIds.length);
  });
});
