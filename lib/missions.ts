import type { PrismaClient } from "@prisma/client";
import { applyCreditTransaction } from "./apply-credit-transaction";

export const MISSION_TYPES = {
  MAKE_PREDICTIONS: "MAKE_PREDICTIONS",
  WIN_PREDICTIONS: "WIN_PREDICTIONS",
  DAILY_LOGIN: "DAILY_LOGIN",
  FOLLOW_EVENTS: "FOLLOW_EVENTS",
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
  const dayStart = getStartOfDay(now);
  const weekStart = getStartOfWeek(now);

  const activeMissions = await prisma.mission.findMany({
    where: { active: true },
    orderBy: { period: "asc" },
  });

  if (activeMissions.length === 0) return [];

  const toEnsure: { missionId: string; periodStart: Date }[] = [];
  for (const m of activeMissions) {
    if (m.period === "DAILY") toEnsure.push({ missionId: m.id, periodStart: dayStart });
    if (m.period === "WEEKLY") toEnsure.push({ missionId: m.id, periodStart: weekStart });
  }

  for (const { missionId, periodStart } of toEnsure) {
    await prisma.userMission.upsert({
      where: {
        userId_missionId_periodStart: { userId, missionId, periodStart },
      },
      create: { userId, missionId, periodStart },
      update: {},
    });
  }

  const userMissions = await prisma.userMission.findMany({
    where: {
      userId,
      periodStart: { in: [dayStart, weekStart] },
    },
    include: {
      mission: {
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          target: true,
          reward: true,
          period: true,
        },
      },
    },
    orderBy: { periodStart: "asc" },
  });

  return userMissions
    .filter((um): um is typeof um & { missionId: string; mission: NonNullable<typeof um.mission> } => um.missionId != null && um.mission != null)
    .map((um) => ({
      id: um.id,
      missionId: um.missionId,
      progress: um.progress,
      completed: um.completed,
      completedAt: um.completedAt,
      periodStart: um.periodStart,
      mission: um.mission,
    }));
}

/**
 * Incrementa il progresso per le missioni del tipo indicato e del periodo corrente.
 * Se missionCategory è fornito, per le missioni con category impostata conta solo se mission.category === missionCategory.
 * Se il progresso raggiunge il target, completa la missione e accredita la ricompensa.
 */
export async function updateMissionProgress(
  prisma: PrismaClient,
  userId: string,
  missionType: string,
  amount: number = 1,
  missionCategory?: string | null
): Promise<{ completed: Array<{ name: string; reward: number }> }> {
  if (amount < 1) return { completed: [] };

  const now = new Date();
  const dayStart = getStartOfDay(now);
  const weekStart = getStartOfWeek(now);

  const whereMission: { type: string; active: boolean; category?: string } = {
    type: missionType,
    active: true,
  };
  if (missionCategory != null) whereMission.category = missionCategory;

  const missions = await prisma.mission.findMany({
    where: whereMission,
    select: { id: true, name: true, target: true, reward: true, period: true },
  });

  const completed: Array<{ name: string; reward: number }> = [];

  for (const mission of missions) {
    const periodStart = mission.period === "DAILY" ? dayStart : weekStart;
    const um = await prisma.userMission.findUnique({
      where: {
        userId_missionId_periodStart: { userId, missionId: mission.id, periodStart },
      },
    });
    if (!um || um.completed) continue;

    const newProgress = Math.min(um.progress + amount, mission.target);
    const justCompleted = newProgress >= mission.target;

    await prisma.userMission.update({
      where: { id: um.id },
      data: {
        progress: newProgress,
        ...(justCompleted && {
          completed: true,
          completedAt: new Date(),
        }),
      },
    });

    if (justCompleted) {
      completed.push({ name: mission.name, reward: mission.reward });
      await applyCreditTransaction(prisma, userId, "MISSION_REWARD", mission.reward, {
        referenceId: um.id,
        referenceType: "user_mission",
      });
    }
  }

  return { completed };
}
