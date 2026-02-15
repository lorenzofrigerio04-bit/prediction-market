/**
 * Test Fase 5: crea in DB 1–2 eventi generati a mano tramite createEventsFromGenerated.
 * La scadenza (closesAt) è sempre coerente con la data esito nel titolo/descrizione.
 *
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
import type { GeneratedEvent, AllowedCategory } from "../lib/event-generation";
import { parseOutcomeDateFromText } from "../lib/event-generation/closes-at";
import { getClosureRules } from "../lib/event-generation/config";

const prisma = new PrismaClient();

/** Calcola closesAt ISO coerente con la data esito in title+description. */
function computeClosesAtIso(title: string, description: string, category: string): string {
  const text = `${title} ${description}`.trim();
  const outcomeDate = parseOutcomeDateFromText(text);
  const rules = getClosureRules();
  const now = new Date();

  if (outcomeDate && outcomeDate.getTime() > now.getTime()) {
    const closeAt = new Date(
      outcomeDate.getTime() - rules.hoursBeforeEvent * 60 * 60 * 1000
    );
    const minClose = new Date(
      now.getTime() + rules.minHoursFromNow * 60 * 60 * 1000
    );
    const d = closeAt.getTime() >= minClose.getTime() ? closeAt : minClose;
    return d.toISOString();
  }
  const defaultDays =
    (rules.defaultDaysByCategory as Record<string, number>)[category] ??
    rules.mediumTermDays;
  return new Date(
    now.getTime() + defaultDays * 24 * 60 * 60 * 1000
  ).toISOString();
}

const SAMPLE_DEFS: Array<{
  title: string;
  description: string;
  category: AllowedCategory;
  resolutionSourceUrl: string;
  resolutionNotes: string;
}> = [
  {
    title: "Il Bitcoin supererà i 120.000$ entro giugno 2025?",
    description:
      "Previsione sul prezzo della criptovaluta. Esito verificabile a giugno 2025. Fonte: CoinGecko e exchange principali.",
    category: "Tecnologia",
    resolutionSourceUrl: "https://www.coingecko.com/en/coins/bitcoin",
    resolutionNotes:
      "Risoluzione in base al prezzo spot su CoinGecko (o equivalente) alla data di chiusura.",
  },
  {
    title: "La squadra italiana vincerà almeno una medaglia d'oro alle Olimpiadi 2028?",
    description:
      "Previsione sui risultati della delegazione italiana ai Giochi Olimpici di Los Angeles. Esito verificabile ad agosto 2028 dopo la conclusione dei Giochi.",
    category: "Sport",
    resolutionSourceUrl: "https://olympics.com/en/olympic-games/los-angeles-2028",
    resolutionNotes: "Risoluzione ufficiale dal sito del CIO dopo la conclusione dei Giochi.",
  },
];

const SAMPLE_EVENTS: GeneratedEvent[] = SAMPLE_DEFS.map((def) => ({
  title: def.title,
  description: def.description,
  category: def.category as AllowedCategory,
  resolutionSourceUrl: def.resolutionSourceUrl,
  resolutionNotes: def.resolutionNotes,
  closesAt: computeClosesAtIso(def.title, def.description, def.category),
}));

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
