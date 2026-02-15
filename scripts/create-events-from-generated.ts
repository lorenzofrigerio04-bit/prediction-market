/**
 * Test Fase 5: crea in DB 1–2 eventi generati a mano tramite createEventsFromGenerated.
 * Esegui: npm run create-events-from-generated
 * Oppure: npx tsx scripts/create-events-from-generated.ts
 *
 * Richiede: DATABASE_URL, e utente sistema o admin (dopo db:seed) o EVENT_GENERATOR_USER_ID.
 */

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { createEventsFromGenerated } from "../lib/event-generation";
import type { GeneratedEvent } from "../lib/event-generation";

const prisma = new PrismaClient();

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

const SAMPLE_EVENTS: GeneratedEvent[] = [
  {
    title: "Il Bitcoin supererà i 120.000$ entro giugno 2025?",
    description: "Previsione sul prezzo della criptovaluta. Fonte: CoinGecko e exchange principali.",
    category: "Tecnologia",
    closesAt: futureDate(14),
    resolutionSourceUrl: "https://www.coingecko.com/en/coins/bitcoin",
    resolutionNotes: "Risoluzione in base al prezzo spot su CoinGecko (o equivalente) alla data di chiusura.",
  },
  {
    title: "La squadra italiana vincerà almeno una medaglia d'oro alle Olimpiadi 2028?",
    description: "Previsione sui risultati della delegazione italiana ai Giochi Olimpici di Los Angeles.",
    category: "Sport",
    closesAt: futureDate(30),
    resolutionSourceUrl: "https://olympics.com/en/olympic-games/los-angeles-2028",
    resolutionNotes: "Risoluzione ufficiale dal sito del CIO dopo la conclusione dei Giochi.",
  },
];

async function main() {
  console.log("=== Fase 5: Creazione eventi da generati (createEventsFromGenerated) ===\n");
  console.log("Eventi di test:", SAMPLE_EVENTS.length);
  SAMPLE_EVENTS.forEach((e, i) => console.log(`  ${i + 1}. [${e.category}] ${e.title}`));
  console.log("");

  const result = await createEventsFromGenerated(prisma, SAMPLE_EVENTS);

  console.log("Risultato:");
  console.log("  Creati:", result.created);
  console.log("  Saltati (duplicati):", result.skipped);
  console.log("  Errori:", result.errors.length);
  if (result.eventIds.length) {
    console.log("  ID creati:", result.eventIds.join(", "));
  }
  if (result.errors.length) {
    result.errors.forEach((err) => console.log("  - [%d] %s: %s", err.index, err.title, err.reason));
  }
  console.log("\n✅ Fine.");
}

main()
  .catch((err) => {
    console.error("Errore:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
