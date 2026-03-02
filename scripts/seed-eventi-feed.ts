/**
 * Feed Eventi: elimina tutti i post e crea 10 post AI_IMAGE (foto descrittive),
 * con commenti generati dall'AI (coerenti con l'evento, posizione, argomentazione).
 * Genera le immagini AI in sequenza. I repost riusano l'immagine del post originale.
 *
 * Uso: npx tsx scripts/seed-eventi-feed.ts
 * Richiede: DATABASE_URL, OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getOrCreateBotUsers } from "../lib/simulated-activity/bot-users";
import { runSimulatedPosts } from "../lib/simulated-activity/posts";
import { generateEventImageForPost } from "../lib/ai-image-generation/generate";

const BOT_COUNT = 80;
const NEW_POSTS_COUNT = 10;
const REPOST_COUNT = 2;

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL non configurato.");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("OPENAI_API_KEY richiesta per i commenti AI.");
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

  console.log(
    "Creazione di",
    NEW_POSTS_COUNT,
    "post (tutti AI_IMAGE, commenti generati dall'AI,",
    REPOST_COUNT,
    "repost)..."
  );
  const result = await runSimulatedPosts(prisma, botUserIds, {
    maxPosts: NEW_POSTS_COUNT,
    skipImageTrigger: true,
    forceType: "AI_IMAGE",
    repostCount: REPOST_COUNT,
    useLlmComments: true,
    forceComment: true,
  });
  console.log(
    "Creati",
    result.created,
    "post.",
    result.errors.length > 0 ? "Errori:" : ""
  );
  if (result.errors.length > 0) {
    result.errors.forEach((e) => console.error(" -", e.eventId, e.error));
  }

  const pending = await prisma.post.findMany({
    where: { type: "AI_IMAGE", aiImageUrl: null, source: "BOT" },
    select: { id: true },
  });
  if (pending.length > 0) {
    console.log(
      "\nGenerazione immagini AI per",
      pending.length,
      "post (foto-descrittive)..."
    );
    for (const { id } of pending) {
      const r = await generateEventImageForPost(id);
      if (r.ok) console.log("  OK postId:", id);
      else console.error("  ERR postId:", id, r.error);
    }
  }

  const repostsWithoutImage = await prisma.post.findMany({
    where: {
      type: "AI_IMAGE",
      source: "REPOST",
      aiImageUrl: null,
    },
    select: { id: true, eventId: true },
  });
  for (const repost of repostsWithoutImage) {
    const original = await prisma.post.findFirst({
      where: {
        eventId: repost.eventId,
        aiImageUrl: { not: null },
      },
      select: { aiImageUrl: true },
    });
    if (original?.aiImageUrl) {
      await prisma.post.update({
        where: { id: repost.id },
        data: { aiImageUrl: original.aiImageUrl },
      });
      console.log("  Repost", repost.id, "→ immagine copiata da evento", repost.eventId);
    }
  }

  console.log(
    "\nFatto. Apri /eventi (o /discover) per vedere i",
    NEW_POSTS_COUNT,
    "post con layout X e foto descrittive."
  );
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
