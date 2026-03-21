/**
 * Script per eseguire l'attività simulata in locale (senza aspettare il cron).
 * Uso: npx tsx scripts/simulate-activity.ts
 * Rispetta DISABLE_SIMULATED_ACTIVITY: se true i bot non partono.
 * Se ENABLE_SIMULATED_ACTIVITY non è impostato, in locale viene forzato true (salvo DISABLE=true).
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Imposta env prima di caricare il modulo che legge ENABLE_SIMULATED_ACTIVITY (config)
if (
  process.env.DISABLE_SIMULATED_ACTIVITY !== "true" &&
  process.env.DISABLE_SIMULATED_ACTIVITY !== "1" &&
  process.env.ENABLE_SIMULATED_ACTIVITY !== "true" &&
  process.env.ENABLE_SIMULATED_ACTIVITY !== "1"
) {
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

  const { runSimulatedActivity, ENABLE_SIMULATED_ACTIVITY } = await import("../lib/simulated-activity");
  if (!ENABLE_SIMULATED_ACTIVITY) {
    console.log("Attività simulata disabilitata (DISABLE_SIMULATED_ACTIVITY=true o ENABLE_SIMULATED_ACTIVITY non impostato). Nessun bot eseguito.");
    return;
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
