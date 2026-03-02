/**
 * Seed 100 eventi nel feed eventi (Discover): crea 100 Event in DB, 100 Post AI_IMAGE
 * con commento LLM (presa di parte/argomentazione) e genera le 100 immagini AI.
 *
 * Uso:
 *   npx tsx scripts/seed-100-eventi-feed.ts
 *
 * Variabili d'ambiente obbligatorie:
 *   - DATABASE_URL          (connessione PostgreSQL)
 *   - OPENAI_API_KEY         (commenti LLM + generazione immagini)
 *   - BLOB_READ_WRITE_TOKEN  (upload immagini su Vercel Blob)
 *
 * Opzionali:
 *   - GENERATION_MODEL       (default: gpt-4o-mini, per i commenti)
 *   - AI_IMAGE_MODEL         (default: gpt-image-1.5, per le foto)
 *
 * Idempotenza: eventi con lo stesso dedupKey vengono saltati; post già esistenti
 * per un evento (tipo AI_IMAGE, source BOT) non vengono duplicati. Le immagini
 * vengono generate solo per post che non hanno ancora aiImageUrl.
 *
 * Durata stimata: 100 commenti LLM + 100 immagini in sequenza → circa 30-60 minuti.
 * Costo stimato: ~4-5 EUR (dominato dalle 100 immagini OpenAI).
 *
 * Dati evento: scripts/data/100-eventi-attuali.ts (100 definizioni per categoria).
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getClosureRules } from "../lib/event-generation/config";
import { parseOutcomeDateFromText } from "../lib/event-generation/closes-at";
import { computeDedupKey } from "../lib/event-publishing/dedup";
import { getEventGeneratorUserId } from "../lib/event-generation/create-events";
import { getBParameter } from "../lib/pricing/initialization";
import { getBufferHoursForCategory } from "../lib/markets";
import { ensureAmmStateForEvent } from "../lib/amm/ensure-amm-state";
import { validateMarket } from "../lib/validator";
import { getOrCreateBotUsers } from "../lib/simulated-activity/bot-users";
import { getPersonaForBotIndex } from "../lib/simulated-activity/bot-personas";
import { generateEventPostComment } from "../lib/simulated-activity/generate-bot-comment";
import { generateEventImageForPost } from "../lib/ai-image-generation/generate";
import { EVENTI_ATTUALI_100, type EventoDefSeed } from "./data/100-eventi-attuali";

const prisma = new PrismaClient({ log: ["error", "warn"] });

const RESOLUTION_AUTHORITY_HOST = "dati.gov.it";
const RESOLUTION_SOURCE_URL = "https://dati.gov.it/risoluzione";
const RESOLUTION_NOTES =
  "Risoluzione secondo fonte ufficiale alla data di chiusura.";
const BOT_COUNT = 80;

function computeClosesAtFromText(
  title: string,
  description: string,
  category: string
): Date {
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
    return closeAt.getTime() >= minClose.getTime() ? closeAt : minClose;
  }

  const defaultDays =
    (rules.defaultDaysByCategory as Record<string, number>)[category] ??
    rules.mediumTermDays;
  return new Date(
    now.getTime() + defaultDays * 24 * 60 * 60 * 1000
  );
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL non configurato.");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("OPENAI_API_KEY richiesta per commenti e immagini AI.");
    process.exit(1);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    console.error("BLOB_READ_WRITE_TOKEN richiesto per il salvataggio delle immagini.");
    process.exit(1);
  }

  console.log("=== Seed 100 eventi feed (Event + Post AI_IMAGE + commenti + immagini) ===\n");

  const creatorId = await getEventGeneratorUserId(prisma);
  console.log("Creatore eventi:", creatorId);

  const bots = await getOrCreateBotUsers(prisma, BOT_COUNT);
  const botUserIds = bots.map((b) => b.id);
  if (botUserIds.length === 0) {
    console.error("Nessun bot disponibile. Creazione bot fallita.");
    process.exit(1);
  }
  console.log("Bot disponibili:", botUserIds.length);

  const createdEventIds: string[] = [];
  let skipped = 0;
  let errors = 0;

  console.log("\n1) Creazione 100 Event in DB...");
  for (let i = 0; i < EVENTI_ATTUALI_100.length; i++) {
    const def = EVENTI_ATTUALI_100[i] as EventoDefSeed;
    const closesAt = computeClosesAtFromText(
      def.title,
      def.description,
      def.category
    );

    const marketValidation = validateMarket({
      title: def.title,
      description: def.description ?? null,
      closesAt: closesAt.toISOString(),
      resolutionSourceUrl: RESOLUTION_SOURCE_URL,
      resolutionNotes: RESOLUTION_NOTES,
    });
    if (!marketValidation.valid) {
      console.warn(
        `  [${i + 1}] Saltato (validazione): ${def.title.slice(0, 50)}... → ${marketValidation.reasons.join("; ")}`
      );
      skipped++;
      continue;
    }

    const dedupKey = computeDedupKey({
      title: def.title,
      closesAt,
      resolutionAuthorityHost: RESOLUTION_AUTHORITY_HOST,
    });

    const existing = await prisma.event.findUnique({
      where: { dedupKey },
      select: { id: true },
    });
    if (existing) {
      createdEventIds.push(existing.id);
      if ((createdEventIds.length % 10) === 0) {
        console.log(`  Presi in carico ${createdEventIds.length} eventi (esistenti + nuovi)...`);
      }
      continue;
    }

    try {
      const event = await prisma.event.create({
        data: {
          title: def.title,
          description: def.description,
          category: def.category,
          closesAt,
          b: getBParameter(
            def.category as Parameters<typeof getBParameter>[0],
            "Medium"
          ),
          resolutionBufferHours: getBufferHoursForCategory(def.category),
          resolutionSourceUrl: RESOLUTION_SOURCE_URL,
          resolutionNotes: RESOLUTION_NOTES,
          resolutionAuthorityHost: RESOLUTION_AUTHORITY_HOST,
          createdById: creatorId,
          dedupKey,
          tradingMode: "AMM",
        },
      });
      await ensureAmmStateForEvent(prisma, event.id);
      createdEventIds.push(event.id);
      if ((createdEventIds.length % 10) === 0) {
        console.log(`  Creati ${createdEventIds.length} eventi...`);
      }
    } catch (err) {
      console.error(`  [${i + 1}] Errore creazione evento:`, err);
      errors++;
    }
  }

  console.log(
    `\nEventi creati: ${createdEventIds.length}, saltati: ${skipped}, errori: ${errors}`
  );

  if (createdEventIds.length === 0) {
    console.error("Nessun evento creato. Uscita.");
    process.exit(1);
  }

  const eventsForPosts = await prisma.event.findMany({
    where: { id: { in: createdEventIds } },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log("\n2) Creazione Post (1 per evento) con commento LLM...");
  const postIdsForImages: string[] = [];
  let postsCreated = 0;
  for (let i = 0; i < eventsForPosts.length; i++) {
    const event = eventsForPosts[i];
    if (!event) continue;

    const existingPost = await prisma.post.findFirst({
      where: {
        eventId: event.id,
        type: "AI_IMAGE",
        source: "BOT",
      },
      select: { id: true, aiImageUrl: true },
    });
    if (existingPost) {
      if (!existingPost.aiImageUrl) postIdsForImages.push(existingPost.id);
      continue;
    }

    const botIdx = i % botUserIds.length;
    const userId = botUserIds[botIdx]!;
    const persona = getPersonaForBotIndex(botIdx);

    const content = await generateEventPostComment(
      {
        title: event.title,
        category: event.category,
        description: event.description,
      },
      persona.id
    ).catch(() => null);

    const finalContent =
      content?.trim() ||
      `Tema importante. Cosa ne pensate? (commento generato)`;

    try {
      const post = await prisma.post.create({
        data: {
          userId,
          eventId: event.id,
          content: finalContent,
          type: "AI_IMAGE",
          source: "BOT",
          aiImageUrl: null,
        },
      });
      postIdsForImages.push(post.id);
      postsCreated++;
      if ((postsCreated % 10) === 0) {
        console.log(`  Creati ${postsCreated} post...`);
      }
    } catch (err) {
      console.error(`  Errore post per evento ${event.id}:`, err);
    }
  }

  console.log(`\nPost creati in questa run: ${postsCreated} | Post da generare immagine: ${postIdsForImages.length}`);

  console.log("\n3) Generazione immagini AI (in sequenza, può richiedere diversi minuti)...");
  let okCount = 0;
  let errCount = 0;
  for (let j = 0; j < postIdsForImages.length; j++) {
    const postId = postIdsForImages[j]!;
    const result = await generateEventImageForPost(postId);
    if (result.ok) {
      okCount++;
      if ((okCount % 10) === 0) {
        console.log(`  Immagini generate: ${okCount}/${postIdsForImages.length}`);
      }
    } else {
      errCount++;
      console.error(`  ERR postId ${postId}:`, result.error);
    }
  }

  console.log(
    `\n=== Completato ===\nEventi: ${createdEventIds.length} | Post da immagini: ${postIdsForImages.length} | Immagini OK: ${okCount} | Immagini ERR: ${errCount}`
  );
  console.log("Apri /eventi o /discover per vedere il feed.");
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
