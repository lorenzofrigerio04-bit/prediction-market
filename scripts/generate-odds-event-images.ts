/**
 * Genera immagini AI per tutti i post degli eventi ODDS_API che non ce l'hanno ancora.
 * Uso: npx tsx scripts/generate-odds-event-images.ts
 *
 * Richiede: DATABASE_URL, OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { generateEventImageForPost } from "../lib/ai-image-generation/generate";

const prisma = new PrismaClient({ log: ["error", "warn"] });

async function main() {
  const pending = await prisma.post.findMany({
    where: {
      type: "AI_IMAGE",
      aiImageUrl: null,
      event: { sourceType: "ODDS_API" },
    },
    select: { id: true },
  });

  if (pending.length === 0) {
    console.log("Nessun post senza immagine da generare.");
    return;
  }

  console.log(`Generazione immagini AI per ${pending.length} post...\n`);

  let ok = 0;
  let err = 0;
  for (let i = 0; i < pending.length; i++) {
    const { id } = pending[i]!;
    const r = await generateEventImageForPost(id);
    if (r.ok) {
      ok++;
      console.log(`  [${i + 1}/${pending.length}] OK postId: ${id}`);
    } else {
      err++;
      console.error(`  [${i + 1}/${pending.length}] ERR postId: ${id} - ${r.error}`);
    }
  }

  console.log(`\n=== Completato: ${ok} OK, ${err} errori ===`);
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
