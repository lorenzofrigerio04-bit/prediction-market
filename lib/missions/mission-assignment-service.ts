import type { PrismaClient } from "@prisma/client";
import { getStartOfDay, getStartOfWeek } from "../missions";
import { getUserStats } from "./user-stats";
import { computeLevelFromXP } from "./level-service";

/** Fixed periodStart for permanent missions (CHAPTER, SKILL) - one row per user per template */
const PERMANENT_PERIOD_START = new Date(0);

const DAILY_ANTI_REPEAT_DAYS = 7;
const WEEKLY_ARCHETYPES = ["HABIT", "PERFORMANCE", "EXPLORATION"] as const; // quantity, quality, exploration

/**
 * Ensure user has exactly one DAILY mission for today. Picks from pool excluding last N days.
 */
export async function ensureDailyAssigned(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  const now = new Date();
  const dayStart = getStartOfDay(now);
  const expiresAt = new Date(dayStart);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 1);

  const existing = await prisma.userMission.findFirst({
    where: {
      userId,
      missionTemplateId: { not: null },
      periodStart: dayStart,
      missionTemplate: { type: "DAILY" },
    },
  });
  if (existing) return;

  const recentTemplateIds = await prisma.userMission.findMany({
    where: {
      userId,
      missionTemplateId: { not: null },
      periodStart: { gte: new Date(dayStart.getTime() - DAILY_ANTI_REPEAT_DAYS * 24 * 60 * 60 * 1000) },
    },
    select: { missionTemplateId: true },
  });
  const excludeIds = new Set(
    recentTemplateIds.map((r) => r.missionTemplateId).filter(Boolean) as string[]
  );

  let preferEasy = false;
  try {
    const stats = await getUserStats(prisma, userId);
    preferEasy = stats.totalPredictions < 5;
  } catch {
    // continue without preference
  }

  const templates = await prisma.missionTemplate.findMany({
    where: {
      type: "DAILY",
      isActive: true,
      id: { notIn: [...excludeIds] },
    },
    orderBy: preferEasy ? { difficulty: "asc" } : undefined,
  });

  if (templates.length === 0) return;

  const template = templates[Math.floor(Math.random() * Math.min(templates.length, 5))] ?? templates[0];
  let rewards: { credits: number; xp: number; badgeCode?: string };
  try {
    rewards = JSON.parse(template.rewards) as { credits: number; xp: number; badgeCode?: string };
  } catch {
    rewards = { credits: 30, xp: 15 };
  }

  await prisma.userMission.create({
    data: {
      userId,
      missionTemplateId: template.id,
      periodStart: dayStart,
      progressValue: 0,
      targetValue: template.targetValue,
      status: "ACTIVE",
      expiresAt,
    },
  });
}

/**
 * Ensure user has 3 WEEKLY missions for the current week. One per archetype (quantity, quality, exploration).
 */
export async function ensureWeeklyAssigned(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  const weekStart = getStartOfWeek(new Date());
  const expiresAt = new Date(weekStart);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);

  const existing = await prisma.userMission.findMany({
    where: {
      userId,
      periodStart: weekStart,
      missionTemplateId: { not: null },
      missionTemplate: { type: "WEEKLY" },
    },
    include: { missionTemplate: { select: { category: true } } },
  });
  if (existing.length >= 3) return;

  const usedCategories = new Set(existing.map((e) => e.missionTemplate?.category).filter(Boolean));
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);
  const lastWeekTemplates = await prisma.userMission.findMany({
    where: {
      userId,
      periodStart: lastWeekStart,
      missionTemplateId: { not: null },
    },
    select: { missionTemplateId: true },
  });
  const excludeTemplateIds = new Set(
    lastWeekTemplates.map((t) => t.missionTemplateId).filter(Boolean) as string[]
  );

  for (const archetype of WEEKLY_ARCHETYPES) {
    if (usedCategories.has(archetype)) continue;

    const templates = await prisma.missionTemplate.findMany({
      where: {
        type: "WEEKLY",
        isActive: true,
        category: archetype,
        id: { notIn: [...excludeTemplateIds] },
      },
      take: 5,
    });

    if (templates.length === 0) continue;

    const template = templates[Math.floor(Math.random() * templates.length)]!;
    excludeTemplateIds.add(template.id);

    await prisma.userMission.create({
      data: {
        userId,
        missionTemplateId: template.id,
        periodStart: weekStart,
        progressValue: 0,
        targetValue: template.targetValue,
        status: "ACTIVE",
        expiresAt,
      },
    });
    usedCategories.add(archetype);
    if (usedCategories.size >= 3) break;
  }
}

/**
 * Ensure user has CHAPTER missions for their current level assigned.
 */
export async function ensureChaptersAssigned(
  prisma: PrismaClient,
  userId: string,
  level: number
): Promise<void> {
  const templates = await prisma.missionTemplate.findMany({
    where: { type: "CHAPTER", isActive: true, chapterLevel: level },
  });
  if (templates.length === 0) return;

  for (const template of templates) {
    const existing = await prisma.userMission.findUnique({
      where: {
        userId_missionTemplateId_periodStart: {
          userId,
          missionTemplateId: template.id,
          periodStart: PERMANENT_PERIOD_START,
        },
      },
    });
    if (existing) continue;

    await prisma.userMission.create({
      data: {
        userId,
        missionTemplateId: template.id,
        periodStart: PERMANENT_PERIOD_START,
        progressValue: 0,
        targetValue: template.targetValue,
        status: "ACTIVE",
      },
    });
  }
}

/**
 * Ensure all SKILL missions are assigned to the user (permanent).
 */
export async function ensureSkillAssigned(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  const templates = await prisma.missionTemplate.findMany({
    where: { type: "SKILL", isActive: true },
  });

  for (const template of templates) {
    const existing = await prisma.userMission.findUnique({
      where: {
        userId_missionTemplateId_periodStart: {
          userId,
          missionTemplateId: template.id,
          periodStart: PERMANENT_PERIOD_START,
        },
      },
    });
    if (existing) continue;

    await prisma.userMission.create({
      data: {
        userId,
        missionTemplateId: template.id,
        periodStart: PERMANENT_PERIOD_START,
        progressValue: 0,
        targetValue: template.targetValue,
        status: "ACTIVE",
      },
    });
  }
}

/**
 * Run all assignment steps (daily, weekly, chapters for current level, skill).
 * Each step is independent: a failure in one does not block the others.
 */
export async function ensureAllMissionsAssigned(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  let level = 1;
  try {
    const userXp = await prisma.userXP.findUnique({
      where: { userId },
    });
    const xpTotal = userXp?.xpTotal ?? 0;
    level = userXp?.currentLevel ?? computeLevelFromXP(xpTotal);
  } catch (e) {
    console.error("Mission assignment: userXP lookup failed", e);
  }

  const steps = [
    () => ensureDailyAssigned(prisma, userId),
    () => ensureWeeklyAssigned(prisma, userId),
    () => ensureChaptersAssigned(prisma, userId, level),
    () => ensureSkillAssigned(prisma, userId),
  ];
  for (const step of steps) {
    try {
      await step();
    } catch (e) {
      console.error("Mission assignment step error:", e);
    }
  }
}
