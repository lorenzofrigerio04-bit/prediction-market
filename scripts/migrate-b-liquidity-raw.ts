/**
 * Migrazione b (liquidità) via raw SQL: un colpo solo su events + amm_state.
 * Stessi valori: Sport 500, Politica 750, Economia 1000, Tecnologia 600, Cultura 400, Scienza 650, Intrattenimento 400, altro 500.
 *
 * Run: npx tsx scripts/migrate-b-liquidity-raw.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const eventsResult = await prisma.$executeRaw`
    UPDATE events
    SET b = CASE category
      WHEN 'Sport' THEN 500
      WHEN 'Politica' THEN 750
      WHEN 'Economia' THEN 1000
      WHEN 'Tecnologia' THEN 600
      WHEN 'Cultura' THEN 400
      WHEN 'Scienza' THEN 650
      WHEN 'Intrattenimento' THEN 400
      ELSE 500
    END
  `;
  console.log("events.b aggiornati:", eventsResult);

  const ammResult = await prisma.$executeRaw`
    UPDATE amm_state
    SET b_micros = (SELECT ROUND(e.b * 1000000)::bigint FROM events e WHERE e.id = amm_state.event_id)
  `;
  console.log("amm_state.b_micros aggiornati:", ammResult);

  console.log("Migrazione b (liquidità) completata.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
