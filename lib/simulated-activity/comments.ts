/**
 * Commenti simulati: bot che scrivono commenti e risposte sugli eventi.
 * Stessa logica dell'API comments (senza rate limit / analytics).
 * Opzionale: non creare notifiche per risposte se l'autore è un bot.
 * Riusabile dal cron per thread realistici.
 */

import type { PrismaClient } from "@prisma/client";
import { COMMENT_TEMPLATES, REPLY_PROBABILITY } from "./comment-templates";
import { MAX_COMMENTS_PER_RUN } from "./config";

export interface CreateSimulatedCommentParams {
  userId: string;
  eventId: string;
  content: string;
  parentId?: string;
  /** Se true, non crea notifica per l'autore del commento padre (risposta da bot). */
  isBot?: boolean;
}

export interface RunSimulatedCommentsOptions {
  /** Massimo commenti da creare in una run (default: MAX_COMMENTS_PER_RUN). */
  maxComments?: number;
  /** Probabilità 0–1 di rispondere a un commento esistente (default: REPLY_PROBABILITY). */
  replyProbability?: number;
}

/**
 * Crea un commento a nome di un utente (es. bot).
 * Stesso schema di app/api/comments/route.ts POST: eventId, content, parentId opzionale;
 * validazione content (trim, length 1–2000), verifica evento e parent se fornito.
 * Se isBot è true e parentId è valorizzato, non crea la notifica COMMENT_REPLY per l'autore del padre.
 */
export async function createSimulatedComment(
  prisma: PrismaClient,
  params: CreateSimulatedCommentParams
): Promise<{ success: true; commentId: string } | { success: false; error: string }> {
  const { userId, eventId, content, parentId, isBot = false } = params;

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { success: false, error: "Il commento non può essere vuoto" };
  }
  if (trimmed.length > 2000) {
    return { success: false, error: "Il commento non può superare i 2000 caratteri" };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return { success: false, error: "Evento non trovato" };
  }

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
    });
    if (!parentComment) {
      return { success: false, error: "Commento padre non trovato" };
    }
    if (parentComment.eventId !== eventId) {
      return { success: false, error: "Il commento padre non appartiene a questo evento" };
    }
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      eventId,
      content: trimmed,
      parentId: parentId || null,
    },
  });

  // Se è una risposta e l'autore non è un bot, crea notifica per l'autore del commento padre
  if (parentId && !isBot) {
    const [parentComment, replier] = await Promise.all([
      prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          event: { select: { title: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
    ]);
    if (parentComment && parentComment.userId !== userId) {
      const replierName = replier?.name ?? "Qualcuno";
      await prisma.notification.create({
        data: {
          userId: parentComment.userId,
          type: "COMMENT_REPLY",
          data: JSON.stringify({
            commentId: comment.id,
            eventId: parentComment.eventId,
            eventTitle: parentComment.event.title,
            replierName,
          }),
        },
      });
    }
  }

  return { success: true, commentId: comment.id };
}

/**
 * Esegue una run di commenti simulate: eventi aperti, scelta random di evento e bot;
 * contenuto da comment-templates (filtrando per event.category se presente);
 * con probabilità replyProbability usa come parentId un commento esistente sull'evento
 * (Comment con eventId, parentId: null, hidden: false).
 * Limite maxComments (default MAX_COMMENTS_PER_RUN).
 */
export async function runSimulatedComments(
  prisma: PrismaClient,
  botUserIds: string[],
  options?: RunSimulatedCommentsOptions
): Promise<{ created: number; errors: { eventId: string; userId: string; error: string }[] }> {
  const maxComments = options?.maxComments ?? MAX_COMMENTS_PER_RUN;
  const replyProbability = options?.replyProbability ?? REPLY_PROBABILITY;

  if (botUserIds.length === 0) {
    return { created: 0, errors: [] };
  }

  const now = new Date();
  const openEvents = await prisma.event.findMany({
    where: {
      resolved: false,
      closesAt: { gt: now },
    },
    select: { id: true, category: true },
  });

  if (openEvents.length === 0) {
    return { created: 0, errors: [] };
  }

  let created = 0;
  const errors: { eventId: string; userId: string; error: string }[] = [];

  for (let i = 0; i < maxComments; i++) {
    const event = openEvents[Math.floor(Math.random() * openEvents.length)];
    const userId = botUserIds[Math.floor(Math.random() * botUserIds.length)];

    const eligibleTemplates = COMMENT_TEMPLATES.filter(
      (t) => !t.category || t.category === event.category
    );
    if (eligibleTemplates.length === 0) {
      continue;
    }
    const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
    const content = template.text;

    let parentId: string | undefined;
    if (Math.random() < replyProbability) {
      const topLevelComments = await prisma.comment.findMany({
        where: {
          eventId: event.id,
          parentId: null,
          hidden: false,
        },
        select: { id: true },
        take: 20,
      });
      if (topLevelComments.length > 0) {
        parentId = topLevelComments[Math.floor(Math.random() * topLevelComments.length)].id;
      }
    }

    const result = await createSimulatedComment(prisma, {
      userId,
      eventId: event.id,
      content,
      parentId,
      isBot: true,
    });

    if (result.success) {
      created++;
    } else {
      errors.push({ eventId: event.id, userId, error: result.error });
    }
  }

  return { created, errors };
}
