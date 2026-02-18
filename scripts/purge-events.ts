/**
 * Script per eliminare tutti gli eventi dal database
 * Uso: pnpm purge:events
 * 
 * Elimina tutti gli eventi e le relazioni correlate (Comment, Prediction) tramite cascade.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL non configurato (usa .env o variabili d'ambiente).");
    process.exit(1);
  }

  try {
    console.log("Inizio purge eventi...");

    // Elimina tutti gli eventi
    // Le relazioni Comment e Prediction verranno eliminate automaticamente tramite cascade
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
