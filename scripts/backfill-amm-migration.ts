/**
 * Backfill after add_amm_credits_micros_trading_mode migration:
 * - users.creditsMicros = credits * 1_000_000
 * - events.tradingMode = 'LEGACY' for all existing events
 *
 * Run after migration: npx tsx scripts/backfill-amm-migration.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SCALE = 1_000_000;

async function main() {
  // Backfill users: creditsMicros = credits * 1_000_000 (use bigint to avoid overflow)
  const usersResult = await prisma.$executeRaw`
    UPDATE users
    SET credits_micros = credits::bigint * ${SCALE}
    WHERE credits_micros = 0
  `;
  console.log("Users updated (creditsMicros):", usersResult);

  // Ensure all events have tradingMode LEGACY (migration default should set it; this is idempotent)
  const eventsResult = await prisma.$executeRaw`
    UPDATE events
    SET trading_mode = 'LEGACY'
    WHERE trading_mode IS NULL OR trading_mode = ''
  `;
  console.log("Events updated (tradingMode=LEGACY):", eventsResult);

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
