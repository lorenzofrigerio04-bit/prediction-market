import type { PrismaClient } from "@prisma/client";

/** Criteri per sbloccare un badge (JSON nel campo criteria) */
export interface BadgeCriteria {
  predictions?: number;
  correctPredictions?: number;
  streak?: number;
  accuracy?: number; // minimo % (0-100)
  eventsCreated?: number;
}

/** Effect JSON for badge (multiplier, profile border, etc.) */
export interface BadgeEffect {
  type: "BONUS_MULTIPLIER" | "PROFILE_BORDER" | "DAILY_BONUS";
  value?: number; // e.g. 0.1 for +10%
  durationDays?: number;
}

/** Dati per creare un badge nel seed */
export interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  criteria: BadgeCriteria;
  code?: string; // Stable code for mission rewards (e.g. STREAK_3, ACCURACY_60)
  effect?: BadgeEffect;
}

export const DEFAULT_BADGES: BadgeDefinition[] = [
  {
    name: "Primo evento",
    description: "Hai creato il tuo primo evento di previsione",
    icon: "📝",
    rarity: "COMMON",
    criteria: { eventsCreated: 1 },
    code: "FIRST_EVENT_CREATED",
  },
  {
    name: "Prima previsione",
    description: "Hai fatto la tua prima previsione",
    icon: "🎯",
    rarity: "COMMON",
    criteria: { predictions: 1 },
    code: "FIRST_PREDICTION",
  },
  {
    name: "Apprendista",
    description: "Hai fatto 10 previsioni",
    icon: "📚",
    rarity: "COMMON",
    criteria: { predictions: 10 },
    code: "APPRENTICE",
  },
  {
    name: "Veggente",
    description: "Hai fatto 50 previsioni",
    icon: "🔮",
    rarity: "RARE",
    criteria: { predictions: 50 },
    code: "SEER",
    effect: { type: "PROFILE_BORDER", value: 1 },
  },
  {
    name: "Oracolo",
    description: "Hai fatto 100 previsioni",
    icon: "✨",
    rarity: "EPIC",
    criteria: { predictions: 100 },
    code: "ORACLE",
    effect: { type: "PROFILE_BORDER", value: 2 },
  },
  {
    name: "Prima vittoria",
    description: "Hai vinto la tua prima previsione",
    icon: "🏆",
    rarity: "COMMON",
    criteria: { correctPredictions: 1 },
    code: "FIRST_WIN",
  },
  {
    name: "Vincente",
    description: "Hai vinto 10 previsioni",
    icon: "⭐",
    rarity: "RARE",
    criteria: { correctPredictions: 10 },
    code: "WINNER",
  },
  {
    name: "Streak 3 giorni",
    description: "3 giorni consecutivi di bonus giornaliero",
    icon: "🔥",
    rarity: "COMMON",
    criteria: { streak: 3 },
    code: "STREAK_3",
    effect: { type: "BONUS_MULTIPLIER", value: 0.1 },
  },
  {
    name: "Streak 7 giorni",
    description: "Una settimana di bonus giornaliero consecutivi",
    icon: "💪",
    rarity: "RARE",
    criteria: { streak: 7 },
    code: "STREAK_7",
    effect: { type: "BONUS_MULTIPLIER", value: 0.2 },
  },
  {
    name: "Streak 30 giorni",
    description: "Un mese di bonus giornaliero consecutivi",
    icon: "👑",
    rarity: "LEGENDARY",
    criteria: { streak: 30 },
    code: "STREAK_30",
    effect: { type: "BONUS_MULTIPLIER", value: 0.5 },
  },
  {
    name: "Precisione 60%",
    description: "Almeno 60% di previsioni corrette (min. 5 risolte)",
    icon: "🎲",
    rarity: "RARE",
    criteria: { accuracy: 60 },
    code: "ACCURACY_60",
  },
  {
    name: "Precisione 80%",
    description: "Almeno 80% di previsioni corrette (min. 10 risolte)",
    icon: "🎪",
    rarity: "EPIC",
    criteria: { accuracy: 80 },
    code: "ACCURACY_80",
  },
];

function parseCriteria(criteriaJson: string | null): BadgeCriteria | null {
  if (!criteriaJson) return null;
  try {
    return JSON.parse(criteriaJson) as BadgeCriteria;
  } catch {
    return null;
  }
}

function meetsCriteria(
  criteria: BadgeCriteria,
  stats: {
    totalPredictions: number;
    correctPredictions: number;
    streak: number;
    accuracy: number;
    eventsCreated: number;
  }
): boolean {
  if (criteria.predictions !== undefined && stats.totalPredictions < criteria.predictions)
    return false;
  if (criteria.correctPredictions !== undefined && stats.correctPredictions < criteria.correctPredictions)
    return false;
  if (criteria.streak !== undefined && stats.streak < criteria.streak)
    return false;
  if (criteria.eventsCreated !== undefined && stats.eventsCreated < criteria.eventsCreated)
    return false;
  if (criteria.accuracy !== undefined) {
    const minResolved = 5;
    if (stats.totalPredictions < minResolved) return false;
    if (stats.accuracy < criteria.accuracy) return false;
  }
  return true;
}

/**
 * Verifica i criteri di tutti i badge e assegna quelli non ancora posseduti.
 * Da chiamare dopo azioni rilevanti (previsione, daily bonus, risoluzione evento).
 */
export async function checkAndAwardBadges(
  prisma: PrismaClient,
  userId: string
): Promise<{ awarded: string[] }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, streakCount: true },
  });
  if (!user) return { awarded: [] };

  const [totalPredictions, correctCount, resolvedCount, eventsCreated] = await Promise.all([
    prisma.prediction.count({ where: { userId } }),
    prisma.prediction.count({ where: { userId, won: true } }),
    prisma.prediction.count({ where: { userId, resolved: true } }),
    prisma.event.count({ where: { createdById: userId } }),
  ]);
  const accuracy = resolvedCount > 0 ? Math.round((correctCount / resolvedCount) * 100) : 0;

  const stats = {
    totalPredictions,
    correctPredictions: correctCount,
    streak: user.streakCount,
    accuracy,
    eventsCreated,
  };

  const existingBadgeIds = new Set(
    (
      await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      })
    ).map((ub) => ub.badgeId)
  );

  const allBadges = await prisma.badge.findMany();
  const awarded: string[] = [];

  for (const badge of allBadges) {
    if (existingBadgeIds.has(badge.id)) continue;
    const criteria = parseCriteria(badge.criteria);
    if (!criteria) continue;
    if (!meetsCriteria(criteria, stats)) continue;

    await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });
    awarded.push(badge.name);
    existingBadgeIds.add(badge.id);

    // Crea notifica per il badge assegnato
    await prisma.notification.create({
      data: {
        userId,
        type: "BADGE_AWARDED",
        data: JSON.stringify({
          badgeId: badge.id,
          badgeName: badge.name,
          badgeDescription: badge.description,
        }),
      },
    });
  }

  return { awarded };
}
