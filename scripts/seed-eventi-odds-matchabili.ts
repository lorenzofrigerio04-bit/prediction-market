/**
 * Aggiunge eventi matchabili con The Odds API (formato "X vincerà contro Y?").
 * Questi eventi mostrano il badge quote e il comparatore bookmaker.
 *
 * Uso: npx tsx scripts/seed-eventi-odds-matchabili.ts
 *
 * Richiede: DATABASE_URL
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { computeDedupKey } from "../lib/event-publishing/dedup";
import { getEventGeneratorUserId } from "../lib/event-utils";
import { getBParameter } from "../lib/pricing/initialization";
import { getBufferHoursForCategory } from "../lib/markets";
import { ensureAmmStateForEvent } from "../lib/amm/ensure-amm-state";

const prisma = new PrismaClient({ log: ["error", "warn"] });

const RESOLUTION_SOURCE_URL = "https://www.legaseriea.it/it/serie-a/calendario-e-risultati";
const RESOLUTION_NOTES = "Risultato ufficiale Lega Serie A alla fine della partita.";

const EVENTI_MATCHABILI = [
  {
    title: "Il Napoli vincerà contro il Torino?",
    description: "Il Napoli vincerà la partita di Serie A contro il Torino. Esito verificabile a fine incontro.",
    category: "Calcio",
  },
  {
    title: "La Juve vincerà contro il Milan?",
    description: "La Juventus vincerà la partita contro il Milan. Esito verificabile a fine incontro.",
    category: "Calcio",
  },
  {
    title: "L'Inter vincerà contro il Bologna?",
    description: "L'Inter vincerà la partita di Serie A contro il Bologna. Esito verificabile a fine incontro.",
    category: "Calcio",
  },
  {
    title: "La Lazio vincerà contro la Roma?",
    description: "La Lazio vincerà il derby contro la Roma. Esito verificabile a fine incontro.",
    category: "Calcio",
  },
  {
    title: "L'Atalanta vincerà contro la Fiorentina?",
    description: "L'Atalanta vincerà la partita contro la Fiorentina. Esito verificabile a fine incontro.",
    category: "Calcio",
  },
];

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL richiesta.");
    process.exit(1);
  }

  const creatorId = await getEventGeneratorUserId(prisma);
  const now = new Date();
  const closesAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 giorni

  console.log("Aggiunta eventi matchabili con The Odds API...\n");

  for (const def of EVENTI_MATCHABILI) {
    const dedupKey = computeDedupKey({
      title: def.title,
      closesAt,
      resolutionAuthorityHost: "legaseriea.it",
    });

    const existing = await prisma.event.findUnique({
      where: { dedupKey },
      select: { id: true, title: true },
    });

    if (existing) {
      console.log(`  Già esistente: "${def.title.slice(0, 50)}..."`);
      continue;
    }

    try {
      const event = await prisma.event.create({
        data: {
          title: def.title,
          description: def.description,
          category: def.category,
          closesAt,
          b: getBParameter(def.category as Parameters<typeof getBParameter>[0], "Medium"),
          resolutionBufferHours: getBufferHoursForCategory(def.category),
          resolutionSourceUrl: RESOLUTION_SOURCE_URL,
          resolutionNotes: RESOLUTION_NOTES,
          resolutionAuthorityHost: "legaseriea.it",
          createdById: creatorId,
          dedupKey,
          tradingMode: "AMM",
        },
      });
      await ensureAmmStateForEvent(prisma, event.id);
      console.log(`  Creato: "${def.title}"`);
    } catch (err) {
      console.error(`  Errore per "${def.title}":`, err);
    }
  }

  console.log("\nFatto. Gli eventi con formato 'X vincerà contro Y?' mostreranno il badge quote se il match è in calendario su The Odds API.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
