/**
 * Esegue la pipeline eventi da The Odds API (senza server).
 * Uso: npx tsx scripts/run-odds-pipeline.ts
 *
 * Richiede: DATABASE_URL, ODDS_API_KEY
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { runOddsEventPipeline } from "../lib/odds-event-generation/run-pipeline";
import { generateEventImageForPost } from "../lib/ai-image-generation/generate";

const prisma = new PrismaClient({ log: ["error", "warn"] });

async function main() {
  if (!process.env.ODDS_API_KEY?.trim()) {
    console.error("ODDS_API_KEY richiesta in .env");
    process.exit(1);
  }

  console.log("=== Pipeline eventi da The Odds API ===\n");

  const result = await runOddsEventPipeline(prisma);

  console.log(`Eventi fetchati: ${result.eventsFetched}`);
  console.log(`Creati: ${result.created}`);
  console.log(`Saltati (già esistenti/passati): ${result.skipped}`);
  if (result.errors.length > 0) {
    console.log(`Errori: ${result.errors.length}`);
    result.errors.slice(0, 5).forEach((e) => console.log(`  - ${e.sportKey}/${e.eventId}: ${e.reason}`));
  }

  const toGenerate = result.postIdsForImages.slice(0, 10);
  let imagesOk = 0;
  for (const postId of toGenerate) {
    const r = await generateEventImageForPost(postId);
    if (r.ok) imagesOk++;
  }
  console.log(`\nImmagini AI generate: ${imagesOk}/${toGenerate.length}`);

  console.log("\n=== Completato ===");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
