/**
 * Script per eliminare tutti gli eventi dal database
 *
 * Uso:
 *   npm run purge:events -- --dry     (solo conteggio, nessuna eliminazione)
 *   CONFIRM_DELETE_ALL_MARKETS=true npm run purge:events
 *
 * Carica .env e .env.local (DATABASE_URL può essere in uno dei due).
 * Elimina tutti gli eventi. Le relazioni (AmmState, Position, Trade, Comment,
 * Prediction, Post, etc.) vengono eliminate automaticamente tramite cascade.
 */

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  const dryRun = process.argv.includes("--dry");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL non configurato (usa .env o variabili d'ambiente).");
    process.exit(1);
  }

  if (!dryRun && process.env.CONFIRM_DELETE_ALL_MARKETS !== "true") {
    console.error("Per eliminare tutti gli eventi, imposta CONFIRM_DELETE_ALL_MARKETS=true");
    console.error("Esempio: CONFIRM_DELETE_ALL_MARKETS=true pnpm purge:events");
    console.error("Per solo conteggio: pnpm purge:events --dry");
    process.exit(1);
  }

  try {
    const eventCount = await prisma.event.count();
    console.log("Eventi da eliminare:", eventCount);

    if (dryRun) {
      console.log("[DRY RUN] Nessuna eliminazione eseguita.");
      process.exit(0);
    }

    console.log("Inizio purge eventi...");
    const deletedEvents = await prisma.event.deleteMany({});
    console.log(`Eliminati ${deletedEvents.count} eventi.`);
    console.log("Purge eventi completato con successo.");
    process.exit(0);
  } catch (error) {
    console.error("Errore durante la purge eventi:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
