/**
 * Script per eseguire l'attività simulata in locale (senza aspettare il cron).
 * Uso: npx tsx scripts/simulate-activity.ts
 * Carica .env (DATABASE_URL), imposta ENABLE_SIMULATED_ACTIVITY=true se non presente,
 * esegue runSimulatedActivity(prisma) e disconnette.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { runSimulatedActivity } from "../lib/simulated-activity";

if (process.env.ENABLE_SIMULATED_ACTIVITY !== "true" && process.env.ENABLE_SIMULATED_ACTIVITY !== "1") {
  process.env.ENABLE_SIMULATED_ACTIVITY = "true";
}

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL non configurato (usa .env o variabili d'ambiente).");
    process.exit(1);
  }

  console.log("Avvio attività simulata...");
  const result = await runSimulatedActivity(prisma);
  console.log("Risultato:", JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
