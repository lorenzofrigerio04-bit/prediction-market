/**
 * Migration script: delete all events (markets) for Event Gen v2.0 cutover
 *
 * Safety:
 * - Requires CONFIRM_DELETE_ALL_MARKETS=true
 * - --dry: print counts only, no deletes
 * - Cascades to AmmState, Position, Trade, Comment, Prediction, Post, etc. via Prisma
 *
 * Usage:
 *   CONFIRM_DELETE_ALL_MARKETS=true pnpm tsx scripts/migrate-delete-all-markets-v2.ts
 *   pnpm tsx scripts/migrate-delete-all-markets-v2.ts --dry
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error", "warn"] });

async function main() {
  const dryRun = process.argv.includes("--dry");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL non configurato.");
    process.exit(1);
  }

  if (!dryRun && process.env.CONFIRM_DELETE_ALL_MARKETS !== "true") {
    console.error(
      "Per eliminare tutti gli eventi, imposta CONFIRM_DELETE_ALL_MARKETS=true"
    );
    console.error(
      "Esempio: CONFIRM_DELETE_ALL_MARKETS=true pnpm tsx scripts/migrate-delete-all-markets-v2.ts"
    );
    console.error("Per solo conteggio (nessuna eliminazione): pnpm tsx scripts/migrate-delete-all-markets-v2.ts --dry");
    process.exit(1);
  }

  try {
    const eventCount = await prisma.event.count();
    const ammStateCount = await prisma.ammState.count();
    const positionCount = await prisma.position.count();
    const tradeCount = await prisma.trade.count();
    const commentCount = await prisma.comment.count();
    const predictionCount = await prisma.prediction.count();
    const postCount = await prisma.post.count();

    console.log("=== Conteggi pre-eliminazione ===");
    console.log("Event:", eventCount);
    console.log("AmmState:", ammStateCount);
    console.log("Position:", positionCount);
    console.log("Trade:", tradeCount);
    console.log("Comment:", commentCount);
    console.log("Prediction:", predictionCount);
    console.log("Post:", postCount);

    if (dryRun) {
      console.log("\n[DRY RUN] Nessuna eliminazione eseguita.");
      process.exit(0);
    }

    console.log("\nEliminazione eventi (cascade su tabelle correlate)...");
    const deleted = await prisma.event.deleteMany({});
    console.log(`Eliminati ${deleted.count} eventi.`);
    console.log("Migrazione completata.");
    process.exit(0);
  } catch (error) {
    console.error("Errore:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
