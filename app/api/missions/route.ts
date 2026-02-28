import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureUserMissionsForPeriod } from "@/lib/missions";
import { ensureAllMissionsAssigned } from "@/lib/missions/mission-assignment-service";
import { getStartOfDay, getStartOfWeek } from "@/lib/missions";
import { prisma } from "@/lib/prisma";
import {
  computeLevelFromXP,
  getXpToNextLevel,
  getXpRequiredForLevel,
  LEVEL_NAMES,
} from "@/lib/missions/level-service";

export const dynamic = "force-dynamic";

interface MissionDTO {
  id: string;
  title: string;
  description: string;
  progressValue: number;
  targetValue: number;
  rewards: { credits: number; xp: number; badgeCode?: string };
  expiresAt: string | null;
  status: string;
  badgeUnlock: string | null;
  badgeName?: string;
  badgeIcon?: string | null;
  code: string;
  type: string;
  sortOrder?: number | null;
}

function toMissionDTO(um: {
  id: string;
  progressValue: number;
  targetValue: number | null;
  status: string;
  expiresAt: Date | null;
  missionTemplate: {
    title: string;
    description: string;
    code: string;
    type: string;
    rewards: string;
    sortOrder: number | null;
  } | null;
}): MissionDTO | null {
  if (!um.missionTemplate) return null;
  const t = um.missionTemplate;
  let rewards: { credits: number; xp: number; badgeCode?: string } = { credits: 0, xp: 0 };
  try {
    rewards = JSON.parse(t.rewards) as { credits: number; xp: number; badgeCode?: string };
  } catch {
    /* ignore */
  }
  return {
    id: um.id,
    title: t.title,
    description: t.description,
    progressValue: um.progressValue ?? 0,
    targetValue: um.targetValue ?? 0,
    rewards,
    expiresAt: um.expiresAt?.toISOString() ?? null,
    status: um.status,
    badgeUnlock: rewards.badgeCode ?? null,
    code: t.code,
    type: t.type,
    sortOrder: t.sortOrder ?? undefined,
  };
}

/**
 * GET /api/missions
 * Restituisce missioni nuovo sistema (daily, weekly, chapters, skill) + legacy (missions, daily, weekly) e user XP/level.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    try {
      await ensureAllMissionsAssigned(prisma, userId);
    } catch (assignErr) {
      console.error("Mission assignment error (continuing with empty):", assignErr);
      // Table missing or seed not run: return empty new missions, legacy + user still loaded
    }

    let legacyMissions: Awaited<ReturnType<typeof ensureUserMissionsForPeriod>> = [];
    const [userMissionsNew, userXp, user] = await Promise.all([
      prisma.userMission.findMany({
        where: {
          userId,
          missionTemplateId: { not: null },
        },
        include: {
          missionTemplate: {
            select: {
              title: true,
              description: true,
              code: true,
              type: true,
              rewards: true,
              chapterLevel: true,
              sortOrder: true,
            },
          },
        },
      }),
      prisma.userXP.findUnique({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { streakCount: true },
      }),
    ]);
    try {
      legacyMissions = await ensureUserMissionsForPeriod(prisma, userId);
    } catch (legacyErr) {
      console.error("Legacy missions load error (continuing):", legacyErr);
    }

    const dayStart = getStartOfDay(new Date());
    const weekStart = getStartOfWeek(new Date());

    const sameDayUTC = (a: Date, b: Date) =>
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate();

    const dailyNew = userMissionsNew.find(
      (um) =>
        um.missionTemplate?.type === "DAILY" &&
        sameDayUTC(um.periodStart, dayStart)
    );
    const weeklyNew = userMissionsNew.filter(
      (um) =>
        um.missionTemplate?.type === "WEEKLY" &&
        sameDayUTC(um.periodStart, weekStart)
    );
    const chapterMissions = userMissionsNew.filter(
      (um) => um.missionTemplate?.type === "CHAPTER"
    );
    const skillMissions = userMissionsNew.filter(
      (um) => um.missionTemplate?.type === "SKILL"
    );

    const xpTotal = userXp?.xpTotal ?? 0;
    const level = userXp?.currentLevel ?? computeLevelFromXP(xpTotal);
    const xpToNext = getXpToNextLevel(level, xpTotal);
    const xpRequiredForCurrent = getXpRequiredForLevel(level);

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const spinToday = await prisma.transaction.findFirst({
      where: {
        userId,
        type: "SPIN_REWARD",
        createdAt: { gte: todayStart },
      },
      select: { amount: true },
    });
    const canSpinToday = !spinToday;
    const todaySpinCredits = spinToday ? spinToday.amount : null;

    const chapters = [1, 2, 3, 4, 5].map((lvl) => {
      const missions = chapterMissions
        .filter((um) => um.missionTemplate?.chapterLevel === lvl)
        .map((um) => toMissionDTO(um))
        .filter((d): d is MissionDTO => d != null)
        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      return {
        level: lvl,
        title: LEVEL_NAMES[lvl] ?? `Livello ${lvl}`,
        xpRequired: getXpRequiredForLevel(lvl),
        missions,
        isCurrent: level === lvl,
      };
    });

    // Raccogli tutte le missioni DTO e codici badge per arricchire con nome/icona
    const allMissionDTOs: MissionDTO[] = [
      ...(dailyNew ? [toMissionDTO(dailyNew)!].filter(Boolean) : []),
      ...weeklyNew.map(toMissionDTO).filter((d): d is MissionDTO => d != null),
      ...chapters.flatMap((ch) => ch.missions),
      ...skillMissions.map((um) => toMissionDTO(um)).filter((d): d is MissionDTO => d != null),
    ];
    const badgeCodes = [...new Set(allMissionDTOs.map((m) => m.badgeUnlock).filter(Boolean))] as string[];
    const badgeMap = new Map<string, { name: string; icon: string | null }>();
    if (badgeCodes.length > 0) {
      const badges = await prisma.badge.findMany({
        where: { code: { in: badgeCodes } },
        select: { code: true, name: true, icon: true },
      });
      for (const b of badges) {
        if (b.code) badgeMap.set(b.code, { name: b.name, icon: b.icon });
      }
    }
    const enrich = (m: MissionDTO): MissionDTO => {
      if (!m.badgeUnlock) return m;
      const badge = badgeMap.get(m.badgeUnlock);
      return badge ? { ...m, badgeName: badge.name, badgeIcon: badge.icon } : m;
    };

    const legacyFormatted = legacyMissions
      .filter((um) => um.mission != null)
      .map((um) => ({
        id: um.id,
        missionId: um.missionId,
        name: um.mission!.name,
        description: um.mission!.description,
        type: um.mission!.type,
        target: um.mission!.target,
        reward: um.mission!.reward,
        period: um.mission!.period,
        progress: um.progress,
        completed: um.completed,
        completedAt: um.completedAt,
        periodStart: um.periodStart,
      }));

    return NextResponse.json({
      daily: dailyNew ? enrich(toMissionDTO(dailyNew)!) : null,
      weekly: weeklyNew.map(toMissionDTO).filter((d): d is MissionDTO => d != null).map(enrich),
      chapters: chapters.map((ch) => ({ ...ch, missions: ch.missions.map(enrich) })),
      skill: skillMissions.map(toMissionDTO).filter((d): d is MissionDTO => d != null).map(enrich),
      user: {
        xpTotal,
        level,
        xpToNext,
        xpRequiredForCurrent,
      },
      streak: user?.streakCount ?? 0,
      canSpinToday,
      todaySpinCredits,
      missions: legacyFormatted,
      missionLegacy: {
        daily: legacyFormatted.filter((m) => m.period === "DAILY"),
        weekly: legacyFormatted.filter((m) => m.period === "WEEKLY"),
      },
    });
  } catch (error) {
    console.error("Error fetching missions:", error);
    const message =
      error instanceof Error ? error.message : "Errore nel caricamento delle missioni";
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { error: isDev ? message : "Errore nel caricamento delle missioni" },
      { status: 500 }
    );
  }
}
