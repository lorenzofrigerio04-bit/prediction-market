/**
 * Verifica quanti eventi e utenti ci sono nel database puntato da DATABASE_URL.
 * Uso: npx dotenv -e .env -- tsx scripts/check-db-events.ts
 * Oppure: DATABASE_URL="..." npx tsx scripts/check-db-events.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const host = url.match(/@([^/]+)/)?.[1] ?? "unknown";
  const isEU = host.includes("eu-central-1") || host.includes("eu-west-2");
  const isUS = host.includes("us-east-1") || host.includes("us-east-2") || host.includes("us-west-2");

  console.log("Database (host):", host);
  console.log("Regione:", isEU ? "EU" : isUS ? "US" : "?");
  console.log("");

  const [eventsCount, usersCount] = await Promise.all([
    prisma.event.count(),
    prisma.user.count(),
  ]);

  console.log("Eventi:", eventsCount);
  console.log("Utenti:", usersCount);
  console.log("");

  if (eventsCount === 0 && usersCount === 0) {
    console.log("⚠️  Il database sembra vuoto. Se volevi i dati da America, rifai la migrazione (Import Data su Neon o pg_dump/pg_restore).");
  } else if (eventsCount === 0) {
    console.log("⚠️  Nessun evento. Verifica che la migrazione abbia copiato anche la tabella events.");
  }
}

main()
  .catch((e) => {
    console.error("Errore:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
