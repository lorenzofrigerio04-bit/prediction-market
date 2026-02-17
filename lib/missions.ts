import type { PrismaClient } from "@prisma/client";

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
  // Mission e UserMission non sono nello schema Prisma: restituiamo array vuoto
  return [];
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

  // Mission e UserMission non sono nello schema Prisma: nessun aggiornamento
  return { completed: [] };
}
