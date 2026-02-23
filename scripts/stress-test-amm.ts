/**
 * Stress test AMM: buy, sell, resolve, payout.
 * Run: RUN_AMM_STRESS=1 npx tsx scripts/stress-test-amm.ts
 * Requires DATABASE_URL. Creates test event + 2 users, runs 20 buys, 10 sells, then resolve.
 */

import { PrismaClient } from "@prisma/client";
import { executeBuyShares, executeSellShares } from "@/lib/amm/engine";
import { resolveMarketMarkResolved, payoutMarketInBatches } from "@/lib/amm/resolve";

const prisma = new PrismaClient();
const SCALE = 1_000_000n;

async function main() {
  if (process.env.RUN_AMM_STRESS !== "1") {
    console.log("Set RUN_AMM_STRESS=1 to run. Skipping.");
    return;
  }

  const uid = `stress-${Date.now()}`;
  const user1 = await prisma.user.create({
    data: {
      email: `${uid}-1@test.local`,
      name: "Stress 1",
      credits: 0,
      creditsMicros: 100n * SCALE,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: `${uid}-2@test.local`,
      name: "Stress 2",
      credits: 0,
      creditsMicros: 100n * SCALE,
    },
  });

  const event = await prisma.event.create({
    data: {
      title: `AMM stress ${uid}`,
      category: "Test",
      closesAt: new Date(Date.now() + 86400_000),
      createdById: user1.id,
      status: "OPEN",
      resolved: false,
      tradingMode: "AMM",
      b: 100,
      dedupKey: `stress-${uid}`,
    },
  });

  await prisma.ammState.create({
    data: {
      eventId: event.id,
      qYesMicros: 0n,
      qNoMicros: 0n,
      bMicros: 100n * SCALE,
    },
  });

  console.log("Created event", event.id, "users", user1.id, user2.id);

  const keys: string[] = [];
  for (let i = 0; i < 20; i++) {
    keys.push(`${uid}-buy-${i}`);
  }

  for (let i = 0; i < 20; i++) {
    const userId = i % 2 === 0 ? user1.id : user2.id;
    const outcome = i % 3 === 0 ? "NO" : "YES";
    await prisma.$transaction((tx) =>
      executeBuyShares(tx, {
        eventId: event.id,
        userId,
        outcome,
        maxCostMicros: 1n * SCALE,
        idempotencyKey: keys[i],
      })
    );
  }

  const pos1 = await prisma.position.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: user1.id } },
  });
  const pos2 = await prisma.position.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: user2.id } },
  });
  const amm = await prisma.ammState.findUnique({ where: { eventId: event.id } });
  console.log("After 20 buys - Position1:", pos1?.yesShareMicros.toString(), pos1?.noShareMicros.toString());
  console.log("Position2:", pos2?.yesShareMicros.toString(), pos2?.noShareMicros.toString());
  console.log("AmmState:", amm?.qYesMicros.toString(), amm?.qNoMicros.toString());

  for (let i = 0; i < 10; i++) {
    const userId = i % 2 === 0 ? user1.id : user2.id;
    const pos = await prisma.position.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
    });
    if (!pos) continue;
    const sellYes = pos.yesShareMicros > 0n;
    const shareMicros = sellYes
      ? (pos.yesShareMicros > 500_000n ? 500_000n : pos.yesShareMicros)
      : (pos.noShareMicros > 500_000n ? 500_000n : pos.noShareMicros);
    if (shareMicros <= 0n) continue;
    await prisma.$transaction((tx) =>
      executeSellShares(tx, {
        eventId: event.id,
        userId,
        outcome: sellYes ? "YES" : "NO",
        shareMicros,
        idempotencyKey: `${uid}-sell-${i}`,
      })
    );
  }

  await prisma.$transaction((tx) =>
    resolveMarketMarkResolved(tx, event.id, "YES")
  );
  const { paidUserIds } = await payoutMarketInBatches(prisma, event.id, "YES", 500);
  console.log("Resolved YES. Paid users:", paidUserIds.length);

  const u1After = await prisma.user.findUnique({
    where: { id: user1.id },
    select: { creditsMicros: true },
  });
  const u2After = await prisma.user.findUnique({
    where: { id: user2.id },
    select: { creditsMicros: true },
  });
  console.log("User1 creditsMicros after:", u1After?.creditsMicros?.toString());
  console.log("User2 creditsMicros after:", u2After?.creditsMicros?.toString());

  await prisma.transaction.deleteMany({ where: { userId: user1.id } });
  await prisma.transaction.deleteMany({ where: { userId: user2.id } });
  await prisma.trade.deleteMany({ where: { eventId: event.id } });
  await prisma.position.deleteMany({ where: { eventId: event.id } });
  await prisma.ammState.deleteMany({ where: { eventId: event.id } });
  await prisma.event.deleteMany({ where: { id: event.id } });
  await prisma.user.deleteMany({ where: { id: user1.id } });
  await prisma.user.deleteMany({ where: { id: user2.id } });

  console.log("Stress test OK.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
