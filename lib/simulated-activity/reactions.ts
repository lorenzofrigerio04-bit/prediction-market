/**
 * Reazioni simulate: bot che mettono like/fire/heart sui commenti.
 * Stessa logica di verifica di app/api/comments/[id]/reactions/route.ts (commento esiste, no duplicato userId+commentId+type).
 * Solo creazione, niente toggle. Riusabile dal cron.
 */

import type { PrismaClient } from "@prisma/client";
import { MAX_REACTIONS_PER_RUN } from "./config";

export const REACTION_TYPES = ["THUMBS_UP", "FIRE", "HEART"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export interface CreateSimulatedReactionParams {
  userId: string;
  commentId: string;
  type: ReactionType;
}

export interface RunSimulatedReactionsOptions {
  /** Massimo reazioni da creare in una run (default: MAX_REACTIONS_PER_RUN). */
  maxReactions?: number;
  /** Se true, prende commenti random invece che solo recenti. */
  randomComments?: boolean;
}

/**
 * Crea una reazione a nome di un utente (es. bot).
 * Verifica che il commento esista e che non ci sia già Reaction per userId+commentId+type.
 * Crea solo, niente toggle.
 */
export async function createSimulatedReaction(
  prisma: PrismaClient,
  params: CreateSimulatedReactionParams
): Promise<{ success: true; reactionId: string } | { success: false; error: string }> {
  const { userId, commentId, type } = params;

  if (!REACTION_TYPES.includes(type)) {
    return { success: false, error: "Tipo di reazione non valido" };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    return { success: false, error: "Commento non trovato" };
  }

  const existingReaction = await prisma.reaction.findFirst({
    where: {
      userId,
      commentId,
      type,
    },
  });

  if (existingReaction) {
    return { success: false, error: "Reazione già presente" };
  }

  const reaction = await prisma.reaction.create({
    data: {
      userId,
      commentId,
      type,
    },
  });

  return { success: true, reactionId: reaction.id };
}

/**
 * Esegue una run di reazioni simulate: commenti recenti (o random) di eventi aperti,
 * per ogni slot sceglie commento + bot + tipo; chiama createSimulatedReaction.
 * Limite maxReactions (default MAX_REACTIONS_PER_RUN).
 */
export async function runSimulatedReactions(
  prisma: PrismaClient,
  botUserIds: string[],
  options?: RunSimulatedReactionsOptions
): Promise<{
  created: number;
  errors: { commentId: string; userId: string; type: string; error: string }[];
}> {
  const maxReactions = options?.maxReactions ?? MAX_REACTIONS_PER_RUN;
  const randomComments = options?.randomComments ?? false;

  if (botUserIds.length === 0) {
    return { created: 0, errors: [] };
  }

  const now = new Date();
  const openEventIds = await prisma.event.findMany({
    where: {
      resolved: false,
      closesAt: { gt: now },
    },
    select: { id: true },
  }).then((events) => events.map((e) => e.id));

  if (openEventIds.length === 0) {
    return { created: 0, errors: [] };
  }

  const comments = await prisma.comment.findMany({
    where: {
      eventId: { in: openEventIds },
      hidden: false,
    },
    select: { id: true },
    orderBy: randomComments ? undefined : { createdAt: "desc" },
    take: Math.max(50, maxReactions * 3),
  });

  if (comments.length === 0) {
    return { created: 0, errors: [] };
  }

  const commentPool = randomComments
    ? [...comments].sort(() => Math.random() - 0.5)
    : comments;

  let created = 0;
  const errors: { commentId: string; userId: string; type: string; error: string }[] = [];

  for (let i = 0; i < maxReactions; i++) {
    const comment = commentPool[i % commentPool.length];
    const userId = botUserIds[Math.floor(Math.random() * botUserIds.length)];
    const type = REACTION_TYPES[Math.floor(Math.random() * REACTION_TYPES.length)];

    const result = await createSimulatedReaction(prisma, {
      userId,
      commentId: comment.id,
      type,
    });

    if (result.success) {
      created++;
    } else {
      errors.push({
        commentId: comment.id,
        userId,
        type,
        error: result.error,
      });
    }
  }

  return { created, errors };
}
