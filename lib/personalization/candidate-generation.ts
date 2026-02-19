import type { PrismaClient } from "@prisma/client";

export type FeedCandidate = {
  eventId: string;
  source: "trending" | "personalized" | "exploration";
};

/**
 * Genera candidati per il feed (trending, personalizzato, exploration).
 * Implementazione minima: restituisce array vuoto; il feed usa fallback da /api/events.
 */
export async function generateFeedCandidates(
  _prisma: PrismaClient,
  _userId: string | null,
  _limit: number
): Promise<FeedCandidate[]> {
  return [];
}
