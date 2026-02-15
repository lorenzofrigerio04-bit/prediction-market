/**
 * Follower simulati: bot che seguono eventi ("X seguono").
 * Verifica che EventFollower non esista già per userId+eventId; crea.
 * Riusabile dal cron.
 */

import type { PrismaClient } from "@prisma/client";
import { MAX_FOLLOWS_PER_RUN } from "./config";

export interface CreateSimulatedFollowParams {
  userId: string;
  eventId: string;
}

export interface RunSimulatedFollowsOptions {
  /** Massimo follow da creare in una run (default: MAX_FOLLOWS_PER_RUN). */
  maxFollows?: number;
}

/**
 * Crea un follow evento a nome di un utente (es. bot).
 * Verifica che EventFollower non esista già per userId+eventId; crea.
 */
export async function createSimulatedFollow(
  prisma: PrismaClient,
  params: CreateSimulatedFollowParams
): Promise<{ success: true; followId: string } | { success: false; error: string }> {
  const { userId, eventId } = params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return { success: false, error: "Evento non trovato" };
  }

  const existing = await prisma.eventFollower.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (existing) {
    return { success: false, error: "Follow già presente" };
  }

  const follow = await prisma.eventFollower.create({
    data: {
      userId,
      eventId,
    },
  });

  return { success: true, followId: follow.id };
}

/**
 * Esegue una run di follow simulate: eventi aperti, bot che non seguono già l'evento;
 * crea fino a maxFollows (default MAX_FOLLOWS_PER_RUN).
 */
export async function runSimulatedFollows(
  prisma: PrismaClient,
  botUserIds: string[],
  options?: RunSimulatedFollowsOptions
): Promise<{
  created: number;
  errors: { eventId: string; userId: string; error: string }[];
}> {
  const maxFollows = options?.maxFollows ?? MAX_FOLLOWS_PER_RUN;

  if (botUserIds.length === 0) {
    return { created: 0, errors: [] };
  }

  const now = new Date();
  const openEvents = await prisma.event.findMany({
    where: {
      resolved: false,
      closesAt: { gt: now },
    },
    select: { id: true },
  });

  if (openEvents.length === 0) {
    return { created: 0, errors: [] };
  }

  const existingFollows = await prisma.eventFollower.findMany({
    where: {
      userId: { in: botUserIds },
      eventId: { in: openEvents.map((e) => e.id) },
    },
    select: { userId: true, eventId: true },
  });

  const existingSet = new Set(
    existingFollows.map((f) => `${f.userId}:${f.eventId}`)
  );

  const candidates: { userId: string; eventId: string }[] = [];
  for (const event of openEvents) {
    for (const userId of botUserIds) {
      if (!existingSet.has(`${userId}:${event.id}`)) {
        candidates.push({ userId, eventId: event.id });
      }
    }
  }

  // Shuffle per varietà
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const toCreate = candidates.slice(0, maxFollows);
  let created = 0;
  const errors: { eventId: string; userId: string; error: string }[] = [];

  for (const { userId, eventId } of toCreate) {
    const result = await createSimulatedFollow(prisma, { userId, eventId });

    if (result.success) {
      created++;
      existingSet.add(`${userId}:${eventId}`);
    } else {
      errors.push({ eventId, userId, error: result.error });
    }
  }

  return { created, errors };
}
