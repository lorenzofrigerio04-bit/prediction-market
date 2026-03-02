/**
 * Elimina tutti i post del feed e ne crea 5 nuovi (mix slide + card con foto AI).
 * Genera le immagini AI in sequenza prima di uscire.
 * Uso: npx tsx scripts/refresh-feed-posts.ts
 * Richiede: DATABASE_URL, OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getOrCreateBotUsers } from "../lib/simulated-activity/bot-users";
import { runSimulatedPosts } from "../lib/simulated-activity/posts";
import { generateEventImageForPost } from "../lib/ai-image-generation/generate";

const BOT_COUNT = 80;
const NEW_POSTS_COUNT = 10;

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL non configurato.");
    process.exit(1);
  }

  console.log("Eliminazione di tutti i post...");
  const deleted = await prisma.post.deleteMany({});
  console.log("Eliminati", deleted.count, "post.");

  const bots = await getOrCreateBotUsers(prisma, BOT_COUNT);
  const botUserIds = bots.map((b) => b.id);
  if (botUserIds.length === 0) {
    console.error("Nessun bot disponibile.");
    process.exit(1);
  }

  console.log("Creazione di", NEW_POSTS_COUNT, "nuovi post (mix slide + foto AI)...");
  const result = await runSimulatedPosts(prisma, botUserIds, {
    maxPosts: NEW_POSTS_COUNT,
    skipImageTrigger: true,
  });
  console.log("Creati", result.created, "post.", result.errors.length > 0 ? "Errori:" : "");
  if (result.errors.length > 0) {
    result.errors.forEach((e) => console.error(" -", e.eventId, e.error));
  }

  const pending = await prisma.post.findMany({
    where: { type: "AI_IMAGE", aiImageUrl: null },
    select: { id: true },
  });
  if (pending.length > 0) {
    console.log("\nGenerazione immagini AI per", pending.length, "post (GPT Image 1.5, prompt foto-descrittivo, quality high)...");
    for (const { id } of pending) {
      const r = await generateEventImageForPost(id);
      if (r.ok) console.log("  OK postId:", id);
      else console.error("  ERR postId:", id, r.error);
    }
  }

  console.log("\nFatto. Ricarica la pagina Eventi per vedere i", NEW_POSTS_COUNT, "post con le nuove immagini (GPT Image 1.5).");
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
