/**
 * Migrates the entire platform to AMM-only:
 * 1. Sets all events to tradingMode = 'AMM'
 * 2. Creates AmmState for every event (if missing)
 * 3. Migrates legacy Predictions to Position + AmmState (credits → shareMicros)
 *
 * Run: npx tsx scripts/migrate-all-events-to-amm.ts
 */

import { PrismaClient } from "@prisma/client";
import { ensureAmmStateForEvent } from "@/lib/amm/ensure-amm-state";

const prisma = new PrismaClient();
const SCALE = 1_000_000;

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

  // 3. Migrate Predictions -> Position + AmmState
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
  let ammStatesUpdated = 0;

  for (const [eventId, preds] of byEvent) {
    let totalYesMicros = 0n;
    let totalNoMicros = 0n;

    await prisma.$transaction(async (tx) => {
      for (const p of preds) {
        const credits = p.credits ?? p.amount ?? 0;
        if (credits <= 0) continue;
        const micros = BigInt(credits) * BigInt(SCALE);
        if (p.outcome === "YES") totalYesMicros += micros;
        else totalNoMicros += micros;

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

      if (totalYesMicros > 0n || totalNoMicros > 0n) {
        const amm = await tx.ammState.findUnique({ where: { eventId } });
        if (amm) {
          await tx.ammState.update({
            where: { eventId },
            data: {
              qYesMicros: amm.qYesMicros + totalYesMicros,
              qNoMicros: amm.qNoMicros + totalNoMicros,
            },
          });
          ammStatesUpdated++;
        }
      }
    });
  }

  console.log("Positions created from Predictions:", positionsCreated);
  console.log("AmmState liquidity updated from Predictions:", ammStatesUpdated);
  console.log("Migration to AMM-only complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
