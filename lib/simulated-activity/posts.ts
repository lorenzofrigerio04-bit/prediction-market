/**
 * Step 10 – Post simulati da bot nel feed.
 * Crea post con source BOT usando la stessa logica Step 5 (slide vs AI_IMAGE);
 * se type AI_IMAGE, il job Step 9 viene triggerato in background.
 * Commenti: se useLlmComments=true l'AI genera commenti coerenti con l'evento (contesto, posizione, argomentazione); altrimenti template persona-based.
 */

import type { PrismaClient } from "@prisma/client";
import { getPostType } from "@/lib/feed/post-type";
import { generateEventImageForPost } from "@/lib/ai-image-generation/generate";
import { MAX_POSTS_PER_RUN } from "./config";
import {
  getPersonaForBotIndex,
  pickCommentTemplate,
} from "./bot-personas";
import { generateEventPostComment } from "./generate-bot-comment";

export interface RunSimulatedPostsResult {
  created: number;
  errors: { eventId: string; userId: string; error: string }[];
}

/**
 * Trigger per la generazione immagine AI.
 * In development: chiamata diretta a generateEventImageForPost (evita fetch su baseUrl/porta sbagliata).
 * In production: fetch in background verso POST /api/ai/generate-event-image.
 */
function triggerAiImageJob(postId: string): void {
  const isDev =
    process.env.NODE_ENV === "development" || !process.env.VERCEL;
  if (isDev) {
    generateEventImageForPost(postId).catch((err) =>
      console.error("[runSimulatedPosts] generateEventImageForPost failed:", err)
    );
    return;
  }
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (baseUrl) {
    const url = `${baseUrl.replace(/\/$/, "")}/api/ai/generate-event-image`;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch((err) =>
      console.error("[runSimulatedPosts] background image trigger failed:", err)
    );
    return;
  }
  generateEventImageForPost(postId).catch((err) =>
    console.error("[runSimulatedPosts] generateEventImageForPost failed:", err)
  );
}

export interface RunSimulatedPostsOptions {
  /** Override del numero massimo di post da creare (default: MAX_POSTS_PER_RUN da config). */
  maxPosts?: number;
  /** Se true, non avviare il job di generazione immagine per i post AI_IMAGE (utile se lo script li processa dopo). */
  skipImageTrigger?: boolean;
  /** Se impostato, forza type a questo valore (es. "AI_IMAGE" per feed eventi solo foto-descrittive). */
  forceType?: "AI_IMAGE";
  /** Numero di repost da creare nella stessa run (stesso eventId già usato, altro bot, con commento). */
  repostCount?: number;
  /** Se true, i commenti sono generati dall'AI (coerenti con evento, posizione, argomentazione); altrimenti template. */
  useLlmComments?: boolean;
  /** Se true, ogni post ha un commento (per seed/feed pieno); altrimenti ~70% con commento. */
  forceComment?: boolean;
}

/**
 * Esegue una run di post simulati: sceglie eventi aperti (recenti), per ciascuno
 * un bot, decide se con commento (persona-based), applica Step 5 per il type (o forceType),
 * crea Post con source BOT (o REPOST per repostCount). Se type AI_IMAGE, triggera il job Step 9.
 */
export async function runSimulatedPosts(
  prisma: PrismaClient,
  botUserIds: string[],
  options?: RunSimulatedPostsOptions
): Promise<RunSimulatedPostsResult> {
  const result: RunSimulatedPostsResult = { created: 0, errors: [] };
  const limit = options?.maxPosts ?? MAX_POSTS_PER_RUN;
  const forceType = options?.forceType;
  const useLlmComments = options?.useLlmComments === true;
  const forceComment = options?.forceComment === true;
  const repostCount = Math.min(
    options?.repostCount ?? 0,
    limit
  );

  if (botUserIds.length === 0) {
    return result;
  }

  const now = new Date();
  const openEvents = await prisma.event.findMany({
    where: {
      resolved: false,
      closesAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, title: true, category: true, description: true },
  });

  if (openEvents.length === 0) {
    return result;
  }

  const usedEventIds = new Set<string>();
  const eventIdsForRepost: string[] = [];

  const primaryCount = limit - repostCount;

  for (let i = 0; i < primaryCount; i++) {
    const event =
      openEvents[Math.floor(Math.random() * openEvents.length)];
    if (usedEventIds.has(event.id)) continue;
    usedEventIds.add(event.id);
    if (repostCount > 0 && eventIdsForRepost.length < repostCount) {
      eventIdsForRepost.push(event.id);
    }

    const botIdx = Math.floor(Math.random() * botUserIds.length);
    const userId = botUserIds[botIdx];
    const persona = getPersonaForBotIndex(botIdx);

    const withComment = forceComment || Math.random() < 0.7;
    let content: string | null = null;
    if (withComment) {
      if (useLlmComments) {
        const aiComment = await generateEventPostComment(
          {
            title: event.title ?? "",
            category: event.category ?? "",
            description: event.description,
          },
          persona.id
        );
        content = aiComment ?? pickCommentTemplate(persona, event.category);
      } else {
        content = pickCommentTemplate(persona, event.category);
      }
    }

    const type =
      forceType ??
      getPostType(
        {
          id: event.id,
          title: event.title ?? "",
          category: event.category ?? "",
          description: event.description,
        },
        content,
        "BOT"
      );

    try {
      const post = await prisma.post.create({
        data: {
          userId,
          eventId: event.id,
          content,
          type,
          source: "BOT",
          aiImageUrl: type === "AI_IMAGE" ? null : undefined,
        },
      });
      result.created++;
      if (type === "AI_IMAGE" && !options?.skipImageTrigger) {
        triggerAiImageJob(post.id);
      }
    } catch (err) {
      result.errors.push({
        eventId: event.id,
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  for (let r = 0; r < repostCount && eventIdsForRepost[r]; r++) {
    const eventId = eventIdsForRepost[r];
    const event = openEvents.find((e) => e.id === eventId);
    if (!event) continue;

    const botIdx = Math.floor(Math.random() * botUserIds.length);
    const userId = botUserIds[botIdx];
    const persona = getPersonaForBotIndex(botIdx);
    let content: string;
    if (useLlmComments) {
      const aiComment = await generateEventPostComment(
        {
          title: event.title ?? "",
          category: event.category ?? "",
          description: event.description,
        },
        persona.id
      );
      content = aiComment ?? pickCommentTemplate(persona, event.category);
    } else {
      content = pickCommentTemplate(persona, event.category);
    }
    const type = forceType ?? "AI_IMAGE";

    try {
      const post = await prisma.post.create({
        data: {
          userId,
          eventId,
          content,
          type,
          source: "REPOST",
          aiImageUrl: null,
        },
      });
      result.created++;
      if (type === "AI_IMAGE" && !options?.skipImageTrigger) {
        triggerAiImageJob(post.id);
      }
    } catch (err) {
      result.errors.push({
        eventId,
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
