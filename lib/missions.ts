import type { PrismaClient } from "@prisma/client";

export const MISSION_TYPES = {
  MAKE_PREDICTIONS: "MAKE_PREDICTIONS",
  WIN_PREDICTIONS: "WIN_PREDICTIONS",
  DAILY_LOGIN: "DAILY_LOGIN",
} as const;

/** Inizio della giornata in UTC (00:00:00.000Z) - evita problemi con SQLite e timezone */
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Inizio della settimana in UTC (lunedì 00:00:00.000Z) */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = domenica, 1 = lunedì
  const diff = day === 0 ? -6 : 1 - day; // lunedì = primo giorno
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getPeriodStart(period: string, date: Date = new Date()): Date {
  if (period === "DAILY") return getStartOfDay(date);
  if (period === "WEEKLY") return getStartOfWeek(date);
  return getStartOfDay(date);
}

/** Fine del giorno successivo (per query a intervallo) */
function getEndOfDay(date: Date = new Date()): Date {
  const d = getStartOfDay(date);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

/** Fine della settimana successiva */
function getEndOfWeek(date: Date = new Date()): Date {
  const d = getStartOfWeek(date);
  d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

/**
 * Assicura che l'utente abbia record UserMission per ogni missione attiva nel periodo corrente.
 * Restituisce i UserMission per il periodo (daily + weekly).
 */
export async function ensureUserMissionsForPeriod(
  prisma: PrismaClient,
  userId: string
): Promise<
  Array<{
    id: string;
    missionId: string;
    progress: number;
    completed: boolean;
    completedAt: Date | null;
    periodStart: Date;
    mission: {
      id: string;
      name: string;
      description: string;
      type: string;
      target: number;
      reward: number;
      period: string;
    };
  }>
> {
  const now = new Date();
  const dailyStart = getStartOfDay(now);
  const weeklyStart = getStartOfWeek(now);
  const dailyEnd = getEndOfDay(now);
  const weeklyEnd = getEndOfWeek(now);

  const activeMissions = await prisma.mission.findMany({
    where: { active: true, period: { in: ["DAILY", "WEEKLY"] } },
  });

  const result: Awaited<ReturnType<typeof ensureUserMissionsForPeriod>> = [];

  for (const mission of activeMissions) {
    const periodStart =
      mission.period === "DAILY" ? dailyStart : weeklyStart;
    const periodEnd = mission.period === "DAILY" ? dailyEnd : weeklyEnd;

    // Cerca per intervallo (evita problemi di confronto DateTime in SQLite)
    let um = await prisma.userMission.findFirst({
      where: {
        userId,
        missionId: mission.id,
        periodStart: { gte: periodStart, lt: periodEnd },
      },
      include: { mission: true },
    });
    if (!um) {
      um = await prisma.userMission.create({
        data: {
          userId,
          missionId: mission.id,
          periodStart,
          progress: 0,
          completed: false,
        },
        include: { mission: true },
      });
    }
    result.push({
      id: um.id,
      missionId: um.mission.id,
      progress: um.progress,
      completed: um.completed,
      completedAt: um.completedAt,
      periodStart: um.periodStart,
      mission: {
        id: um.mission.id,
        name: um.mission.name,
        description: um.mission.description,
        type: um.mission.type,
        target: um.mission.target,
        reward: um.mission.reward,
        period: um.mission.period,
      },
    });
  }

  return result;
}

/**
 * Incrementa il progresso per le missioni del tipo indicato e del periodo corrente.
 * Se il progresso raggiunge il target, completa la missione e accredita la ricompensa.
 */
export async function updateMissionProgress(
  prisma: PrismaClient,
  userId: string,
  missionType: string,
  amount: number = 1
): Promise<{ completed: Array<{ name: string; reward: number }> }> {
  if (amount < 1) return { completed: [] };

  const now = new Date();
  const dailyStart = getStartOfDay(now);
  const weeklyStart = getStartOfWeek(now);
  const dailyEnd = getEndOfDay(now);
  const weeklyEnd = getEndOfWeek(now);

  const missions = await prisma.mission.findMany({
    where: { active: true, type: missionType, period: { in: ["DAILY", "WEEKLY"] } },
  });

  const completed: Array<{ name: string; reward: number }> = [];

  for (const mission of missions) {
    const periodStart =
      mission.period === "DAILY" ? dailyStart : weeklyStart;
    const periodEnd = mission.period === "DAILY" ? dailyEnd : weeklyEnd;

    let um = await prisma.userMission.findFirst({
      where: {
        userId,
        missionId: mission.id,
        periodStart: { gte: periodStart, lt: periodEnd },
      },
    });
    if (!um) {
      um = await prisma.userMission.create({
        data: {
          userId,
          missionId: mission.id,
          periodStart,
          progress: 0,
          completed: false,
        },
      });
    }
    if (um.completed) continue;

    const newProgress = Math.min(um.progress + amount, mission.target);
    const justCompleted = newProgress >= mission.target;

    if (justCompleted) {
      await prisma.userMission.update({
        where: { id: um.id },
        data: {
          progress: mission.target,
          completed: true,
          completedAt: new Date(),
        },
      });
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: mission.reward },
          totalEarned: { increment: mission.reward },
        },
        select: { credits: true },
      });
      await prisma.transaction.create({
        data: {
          userId,
          type: "MISSION_REWARD",
          amount: mission.reward,
          description: `Missione completata: ${mission.name}`,
          referenceId: um.id,
          referenceType: "mission",
          balanceAfter: updatedUser.credits,
        },
      });
      completed.push({ name: mission.name, reward: mission.reward });
    } else {
      await prisma.userMission.update({
        where: { id: um.id },
        data: { progress: newProgress },
      });
    }
  }

  return { completed };
}
