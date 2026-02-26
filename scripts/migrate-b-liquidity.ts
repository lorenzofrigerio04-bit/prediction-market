/**
 * Migrazione: imposta b (liquidità) alto per tutti gli eventi e i relativi AmmState.
 * Così 50 crediti a 50/50 danno ~100 quote (prezzo × quantità).
 *
 * - events.b = getBParameter(category, "Medium") o 500 se categoria sconosciuta
 * - amm_state.b_micros = b * 1_000_000
 *
 * Run: npx tsx scripts/migrate-b-liquidity.ts
 */

import { PrismaClient } from "@prisma/client";
import { getBParameterOrDefault } from "@/lib/pricing/initialization";

const prisma = new PrismaClient();
const SCALE = 1_000_000;

function getBForCategory(category: string): number {
  return getBParameterOrDefault(category);
}

const BATCH = 100;

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, category: true },
  });

  let eventsUpdated = 0;
  let ammUpdated = 0;

  for (let i = 0; i < events.length; i += BATCH) {
    const chunk = events.slice(i, i + BATCH);
    await prisma.$transaction(
      chunk.map((event) => {
        const newB = getBForCategory(event.category);
        return prisma.event.update({
          where: { id: event.id },
          data: { b: newB },
        });
      })
    );
    eventsUpdated += chunk.length;
  }

  const eventB = new Map(
    (await prisma.event.findMany({ select: { id: true, b: true } })).map((e) => [e.id, e.b])
  );
  const ammStates = await prisma.ammState.findMany({
    select: { eventId: true, bMicros: true },
  });

  const toUpdate = ammStates.filter((amm) => {
    const b = eventB.get(amm.eventId);
    if (b == null) return false;
    const newBMicros = BigInt(Math.round(b * SCALE));
    return amm.bMicros !== newBMicros;
  });

  for (let i = 0; i < toUpdate.length; i += BATCH) {
    const chunk = toUpdate.slice(i, i + BATCH);
    await prisma.$transaction(
      chunk.map((amm) => {
        const b = eventB.get(amm.eventId)!;
        return prisma.ammState.update({
          where: { eventId: amm.eventId },
          data: { bMicros: BigInt(Math.round(b * SCALE)) },
        });
      })
    );
    ammUpdated += chunk.length;
  }

  console.log("Migrazione b (liquidità) completata:");
  console.log("  Eventi aggiornati (events.b):", eventsUpdated);
  console.log("  AmmState aggiornati (b_micros):", ammUpdated);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
