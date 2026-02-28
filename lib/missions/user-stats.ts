import type { PrismaClient } from "@prisma/client";

export interface UserStats {
  totalPredictions: number;
  resolvedPredictions: number;
  wins: number;
  losses: number;
  winStreakCurrent: number;
  loginStreakCurrent: number;
  accuracyPercent: number;
  categoriesUsedCount: number;
  categoriesByCount: { category: string; count: number }[];
  underusedCategories: string[]; // bottom N categories by prediction count
  /** Sum of realized P&L (micros) for the current week - for ROI mission */
  weeklyRealizedPlMicros: number;
}

/**
 * Get user stats for mission constraints and skill calculations.
 */
export async function getUserStats(
  prisma: PrismaClient,
  userId: string
): Promise<UserStats> {
  const [user, predictionsByOutcome, categoryCounts, weekStart] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true },
    }),
    prisma.prediction.groupBy({
      by: ["won"],
      where: { userId },
      _count: true,
    }),
    prisma.prediction.groupBy({
      by: ["eventId"],
      where: { userId },
      _count: true,
    }),
    getStartOfWeek(new Date()),
  ]);

  const resolved = await prisma.prediction.count({
    where: { userId, resolved: true },
  });
  const wins = predictionsByOutcome.find((g) => g.won === true)?._count ?? 0;
  const losses = predictionsByOutcome.find((g) => g.won === false)?._count ?? 0;
  const totalPredictions = await prisma.prediction.count({
    where: { userId },
  });

  // Categories: get event categories for each prediction
  const predictionsWithEvent = await prisma.prediction.findMany({
    where: { userId },
    select: { event: { select: { category: true } } },
  });
  const categoryCountMap = new Map<string, number>();
  for (const p of predictionsWithEvent) {
    const cat = p.event?.category ?? "Altro";
    categoryCountMap.set(cat, (categoryCountMap.get(cat) ?? 0) + 1);
  }
  const categoriesByCount = Array.from(categoryCountMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.count - b.count);
  const underusedCategories = categoriesByCount
    .slice(0, 3)
    .map((c) => c.category);

  // Weekly P&L from Trade (realized)
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const trades = await prisma.trade.findMany({
    where: {
      userId,
      createdAt: { gte: weekStart, lt: weekEnd },
    },
    select: { realizedPlMicros: true },
  });
  let weeklyRealizedPlMicros = 0;
  for (const t of trades) {
    if (t.realizedPlMicros != null) {
      weeklyRealizedPlMicros += Number(t.realizedPlMicros);
    }
  }

  const accuracyPercent =
    resolved > 0 ? Math.round((wins / resolved) * 100) : 0;

  // Win streak: consecutive wins (by resolved event order - simplified: we count current streak from last N resolved)
  const winStreakCurrent = await computeCurrentWinStreak(prisma, userId);

  return {
    totalPredictions,
    resolvedPredictions: resolved,
    wins,
    losses,
    winStreakCurrent,
    loginStreakCurrent: user?.streakCount ?? 0,
    accuracyPercent,
    categoriesUsedCount: categoryCountMap.size,
    categoriesByCount,
    underusedCategories,
    weeklyRealizedPlMicros,
  };
}

/** Get start of week (Monday 00:00 UTC). */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Get start of day (00:00 UTC). */
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Compute current win streak: count of consecutive wins from the most recently resolved predictions.
 */
async function computeCurrentWinStreak(
  prisma: PrismaClient,
  userId: string
): Promise<number> {
  const resolved = await prisma.prediction.findMany({
    where: { userId, resolved: true },
    orderBy: { updatedAt: "desc" },
    select: { won: true },
    take: 50,
  });
  let streak = 0;
  for (const p of resolved) {
    if (p.won === true) streak++;
    else break;
  }
  return streak;
}
