/**
 * FOMO (Fear Of Missing Out) Statistics for Events
 * 
 * Calcola e restituisce statistiche per creare urgenza e engagement:
 * - countdown: tempo rimanente fino alla chiusura
 * - participantsCount: numero di partecipanti unici
 * - votesVelocity: voti per ora (ultime 2 ore o fallback)
 * - pointsMultiplier: moltiplicatore punti se scadenza < 6h
 */

import type { PrismaClient } from "@prisma/client";

export interface EventFomoStats {
  /** Tempo rimanente in millisecondi fino a closesAt */
  countdownMs: number;
  /** Numero di partecipanti unici (utenti che hanno fatto previsioni) */
  participantsCount: number;
  /** Voti per ora (calcolato sulle ultime 2 ore o fallback) */
  votesVelocity: number;
  /** Moltiplicatore punti: 1.0 base, 1.1 se <24h, 1.2 se <6h, 1.3 se <2h */
  pointsMultiplier: number;
  /** Indica se l'evento è in scadenza (< 6h) */
  isClosingSoon: boolean;
}

/**
 * Calcola le statistiche FOMO per un singolo evento
 */
export async function getEventStats(
  prisma: PrismaClient,
  eventId: string,
  now: Date = new Date()
): Promise<EventFomoStats> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      closesAt: true,
      createdAt: true,
      _count: {
        select: {
          Prediction: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const closesAt = new Date(event.closesAt);
  const countdownMs = closesAt.getTime() - now.getTime();
  const hoursUntilClose = countdownMs / (1000 * 60 * 60);

  // participantsCount: numero di utenti unici che hanno fatto previsioni
  const participantsCount = await prisma.prediction.groupBy({
    by: ["userId"],
    where: { eventId },
    _count: { userId: true },
  }).then((groups) => groups.length);

  // Fallback: se non ci sono previsioni, usa totalVotes come fallback
  const participantsCountFinal = participantsCount > 0 
    ? participantsCount 
    : event._count.Prediction;

  // votesVelocity: numero voti negli ultimi 120 minuti / 2 (voti per ora)
  const twoHoursAgo = new Date(now.getTime() - 120 * 60 * 1000);
  const recentPredictions = await prisma.prediction.count({
    where: {
      eventId,
      createdAt: {
        gte: twoHoursAgo,
      },
    },
  });

  let votesVelocity = recentPredictions / 2; // voti per ora

  // Fallback: se non ci sono voti recenti, usa totalVotes / max(hoursSinceCreated, 1)
  if (votesVelocity === 0) {
    const hoursSinceCreated = Math.max(
      (now.getTime() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60),
      1
    );
    votesVelocity = event._count.Prediction / hoursSinceCreated;
  }

  // pointsMultiplier: 1.0 base, 1.1 se <24h, 1.2 se <6h, 1.3 se <2h
  let pointsMultiplier = 1.0;
  if (hoursUntilClose > 0) {
    if (hoursUntilClose < 2) {
      pointsMultiplier = 1.3;
    } else if (hoursUntilClose < 6) {
      pointsMultiplier = 1.2;
    } else if (hoursUntilClose < 24) {
      pointsMultiplier = 1.1;
    }
  }

  const isClosingSoon = hoursUntilClose > 0 && hoursUntilClose < 6;

  return {
    countdownMs,
    participantsCount: participantsCountFinal,
    votesVelocity: Math.round(votesVelocity * 100) / 100, // arrotonda a 2 decimali
    pointsMultiplier,
    isClosingSoon,
  };
}

/**
 * Calcola le statistiche FOMO per più eventi in batch (più efficiente)
 */
export async function getEventsWithStats(
  prisma: PrismaClient,
  eventIds: string[],
  now: Date = new Date()
): Promise<Map<string, EventFomoStats>> {
  if (eventIds.length === 0) {
    return new Map();
  }

  // Fetch tutti gli eventi in una query
  const events = await prisma.event.findMany({
    where: {
      id: { in: eventIds },
    },
    select: {
      id: true,
      closesAt: true,
      createdAt: true,
      _count: {
        select: {
          Prediction: true,
        },
      },
    },
  });

  // Fetch tutti i partecipanti unici per evento
  const participantsByEvent = await prisma.prediction.groupBy({
    by: ["eventId", "userId"],
    where: {
      eventId: { in: eventIds },
    },
  });

  // Raggruppa per eventId
  const participantsCountMap = new Map<string, number>();
  for (const p of participantsByEvent) {
    participantsCountMap.set(p.eventId, (participantsCountMap.get(p.eventId) || 0) + 1);
  }

  // Fetch voti recenti (ultime 2 ore) per tutti gli eventi
  const twoHoursAgo = new Date(now.getTime() - 120 * 60 * 1000);
  const recentPredictions = await prisma.prediction.groupBy({
    by: ["eventId"],
    where: {
      eventId: { in: eventIds },
      createdAt: {
        gte: twoHoursAgo,
      },
    },
    _count: {
      eventId: true,
    },
  });

  const recentVotesMap = new Map<string, number>();
  for (const p of recentPredictions) {
    recentVotesMap.set(p.eventId, p._count.eventId);
  }

  // Calcola statistiche per ogni evento
  const statsMap = new Map<string, EventFomoStats>();

  for (const event of events) {
    const closesAt = new Date(event.closesAt);
    const countdownMs = closesAt.getTime() - now.getTime();
    const hoursUntilClose = countdownMs / (1000 * 60 * 60);

    // participantsCount
    const participantsCount = participantsCountMap.get(event.id) || 0;
    const participantsCountFinal = participantsCount > 0 
      ? participantsCount 
      : event._count.Prediction;

    // votesVelocity
    const recentVotes = recentVotesMap.get(event.id) || 0;
    let votesVelocity = recentVotes / 2; // voti per ora

    // Fallback
    if (votesVelocity === 0) {
      const hoursSinceCreated = Math.max(
        (now.getTime() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60),
        1
      );
      votesVelocity = event._count.Prediction / hoursSinceCreated;
    }

    // pointsMultiplier
    let pointsMultiplier = 1.0;
    if (hoursUntilClose > 0) {
      if (hoursUntilClose < 2) {
        pointsMultiplier = 1.3;
      } else if (hoursUntilClose < 6) {
        pointsMultiplier = 1.2;
      } else if (hoursUntilClose < 24) {
        pointsMultiplier = 1.1;
      }
    }

    const isClosingSoon = hoursUntilClose > 0 && hoursUntilClose < 6;

    statsMap.set(event.id, {
      countdownMs,
      participantsCount: participantsCountFinal,
      votesVelocity: Math.round(votesVelocity * 100) / 100,
      pointsMultiplier,
      isClosingSoon,
    });
  }

  return statsMap;
}
