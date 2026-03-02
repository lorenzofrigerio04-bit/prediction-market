/**
 * Sincronizza le immagini nel Blob con il DB: per ogni file in ai-images/*.png
 * verifica se il Post esiste e ha aiImageUrl null, e in tal caso aggiorna con
 * l'URL proxy. Utile quando le immagini sono state caricate nel Blob ma il DB
 * non ha il riferimento (es. dopo reset DB, migrazione, ecc.).
 *
 * Uso: npx tsx scripts/sync-blob-images-to-db.ts
 * Richiede: DATABASE_URL, BLOB_READ_WRITE_TOKEN
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { list } from "@vercel/blob";
import { getAiImageGenerationConfig } from "../lib/ai-image-generation/config";

const prisma = new PrismaClient({ log: ["error", "warn"] });

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL non configurato.");
    process.exit(1);
  }

  let blobToken: string;
  try {
    const config = getAiImageGenerationConfig();
    blobToken = config.blobToken;
  } catch {
    console.error("BLOB_READ_WRITE_TOKEN non configurato.");
    process.exit(1);
  }

  console.log("=== Sync immagini Blob → DB ===\n");

  let totalBlobs = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let cursor: string | undefined;

  do {
    const result = await list({
      prefix: "ai-images/",
      access: "private",
      token: blobToken,
      limit: 500,
      cursor,
    });

    for (const blob of result.blobs) {
      totalBlobs++;
      const pathname = blob.pathname;
      if (!pathname.startsWith("ai-images/") || !pathname.endsWith(".png")) {
        continue;
      }
      const postId = pathname.replace("ai-images/", "").replace(".png", "");
      if (!postId) continue;

      try {
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: { id: true, type: true, aiImageUrl: true },
        });

        if (!post) {
          console.warn(`  Post ${postId} non trovato (blob: ${pathname})`);
          skipped++;
          continue;
        }
        if (post.type !== "AI_IMAGE") {
          skipped++;
          continue;
        }
        if (post.aiImageUrl?.trim()) {
          skipped++;
          continue;
        }

        const proxyUrl = `/api/ai/post-image?postId=${encodeURIComponent(postId)}`;
        await prisma.post.update({
          where: { id: postId },
          data: { aiImageUrl: proxyUrl },
        });
        updated++;
        console.log(`  OK postId: ${postId}`);
      } catch (err) {
        errors++;
        console.error(`  ERR postId ${postId}:`, err);
      }
    }

    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  console.log(
    `\n=== Completato ===\nBlob in ai-images/: ${totalBlobs} | Aggiornati: ${updated} | Saltati: ${skipped} | Errori: ${errors}`
  );
  console.log("Ricarica /discover o /eventi per vedere le immagini.");
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
