/**
 * Migrates the entire platform to AMM-only:
 * 1. Sets all events to tradingMode = 'AMM'
 * 2. Creates AmmState for every event (if missing)
 * 3. Migrates legacy Predictions to Position + AmmState (credits → shareMicros)
 *
 * Uses short transactions + timeout to avoid P2028 on serverless DB (Neon).
 * Idempotent: skips events whose AmmState already has liquidity from Positions.
 *
 * Run: npx tsx scripts/migrate-all-events-to-amm.ts
 */

import { PrismaClient } from "@prisma/client";
import { ensureAmmStateForEvent } from "@/lib/amm/ensure-amm-state";

const prisma = new PrismaClient();
const SCALE = 1_000_000;
const TX_TIMEOUT_MS = 25_000;
const PREDICTIONS_PER_TX = 30;

async function main() {
  // 1. Set all events to AMM
  const eventsUpdated = await prisma.$executeRaw`
    UPDATE events SET trading_mode = 'AMM'
  `;
  console.log("Events set to tradingMode=AMM:", eventsUpdated);

  // 2. Ensure AmmState for every event
  const events = await prisma.event.findMany({
    select: { id: true },
  });
  let ammCreated = 0;
  for (const e of events) {
    const before = await prisma.ammState.count({ where: { eventId: e.id } });
    await ensureAmmStateForEvent(prisma, e.id);
    const after = await prisma.ammState.count({ where: { eventId: e.id } });
    if (after > before) ammCreated++;
  }
  console.log("AmmState created for events that had none:", ammCreated);

  // 3. Migrate Predictions -> Position + AmmState (short transactions per chunk)
  const predictions = await prisma.prediction.findMany({
    where: {},
    select: { eventId: true, userId: true, outcome: true, credits: true, amount: true },
  });

  const byEvent = new Map<string, typeof predictions>();
  for (const p of predictions) {
    const list = byEvent.get(p.eventId) ?? [];
    list.push(p);
    byEvent.set(p.eventId, list);
  }

  let positionsCreated = 0;
  let eventsWithLiquidityUpdated = 0;

  for (const [eventId, preds] of byEvent) {
    const amm = await prisma.ammState.findUnique({ where: { eventId } });
    if (!amm) continue;
    if (amm.qYesMicros > 0n || amm.qNoMicros > 0n) continue;

    for (let i = 0; i < preds.length; i += PREDICTIONS_PER_TX) {
      const chunk = preds.slice(i, i + PREDICTIONS_PER_TX);
      let chunkYes = 0n;
      let chunkNo = 0n;

      await prisma.$transaction(
        async (tx) => {
          for (const p of chunk) {
            const credits = p.credits ?? p.amount ?? 0;
            if (credits <= 0) continue;
            const micros = BigInt(credits) * BigInt(SCALE);
            if (p.outcome === "YES") chunkYes += micros;
            else chunkNo += micros;

            const existing = await tx.position.findUnique({
              where: { eventId_userId: { eventId, userId: p.userId } },
            });
            if (existing) {
              if (p.outcome === "YES") {
                await tx.position.update({
                  where: { eventId_userId: { eventId, userId: p.userId } },
                  data: { yesShareMicros: existing.yesShareMicros + micros },
                });
              } else {
                await tx.position.update({
                  where: { eventId_userId: { eventId, userId: p.userId } },
                  data: { noShareMicros: existing.noShareMicros + micros },
                });
              }
            } else {
              await tx.position.create({
                data: {
                  eventId,
                  userId: p.userId,
                  yesShareMicros: p.outcome === "YES" ? micros : 0n,
                  noShareMicros: p.outcome === "NO" ? micros : 0n,
                },
              });
              positionsCreated++;
            }
          }

          if (chunkYes > 0n || chunkNo > 0n) {
            const current = await tx.ammState.findUnique({ where: { eventId } });
            if (current) {
              await tx.ammState.update({
                where: { eventId },
                data: {
                  qYesMicros: current.qYesMicros + chunkYes,
                  qNoMicros: current.qNoMicros + chunkNo,
                },
              });
              if (i === 0) eventsWithLiquidityUpdated++;
            }
          }
        },
        { timeout: TX_TIMEOUT_MS }
      );
    }
  }

  console.log("Positions created from Predictions:", positionsCreated);
  console.log("Events with AmmState liquidity updated:", eventsWithLiquidityUpdated);
  console.log("Migration to AMM-only complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
