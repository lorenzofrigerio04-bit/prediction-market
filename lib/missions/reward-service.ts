import type { PrismaClient } from "@prisma/client";
import { applyCreditTransaction } from "../apply-credit-transaction";
import { computeLevelFromXP } from "./level-service";

export interface ClaimResult {
  credits: number;
  xp: number;
  badgeUnlocked: string | null;
}

/**
 * Claim a completed mission reward: credits, XP, optional badge. Apply streak multipliers for DAILY.
 */
export async function claimMission(
  prisma: PrismaClient,
  userId: string,
  userMissionId: string
): Promise<ClaimResult> {
  const um = await prisma.userMission.findUnique({
    where: { id: userMissionId },
    include: { missionTemplate: true },
  });

  if (!um || um.userId !== userId) {
    throw new Error("Missione non trovata o non autorizzata");
  }
  if (um.status !== "COMPLETED") {
    throw new Error(
      um.status === "CLAIMED"
        ? "Ricompensa già riscattata"
        : "Missione non ancora completata"
    );
  }

  const template = um.missionTemplate;
  if (!template) throw new Error("Template missione non trovato");

  let rewards: { credits: number; xp: number; badgeCode?: string };
  try {
    rewards = JSON.parse(template.rewards) as { credits: number; xp: number; badgeCode?: string };
  } catch {
    rewards = { credits: 0, xp: 0 };
  }

  let credits = rewards.credits ?? 0;
  const xp = rewards.xp ?? 0;

  if (template.type === "DAILY" && credits > 0) {
    const multiplier = await getMissionRewardMultiplier(prisma, userId);
    credits = Math.round(credits * multiplier);
  }

  await prisma.$transaction(async (tx) => {
    if (credits > 0) {
      await applyCreditTransaction(tx, userId, "MISSION_REWARD", credits, {
        referenceId: um.id,
        referenceType: "user_mission",
      });
    }

    const existing = await tx.userXP.findUnique({
      where: { userId },
    });
    const newXpTotal = (existing?.xpTotal ?? 0) + xp;
    const newLevel = computeLevelFromXP(newXpTotal);

    await tx.userXP.upsert({
      where: { userId },
      create: {
        userId,
        xpTotal: newXpTotal,
        currentLevel: newLevel,
        updatedAt: new Date(),
      },
      update: {
        xpTotal: newXpTotal,
        currentLevel: newLevel,
        updatedAt: new Date(),
      },
    });

    await tx.userMission.update({
      where: { id: userMissionId },
      data: { status: "CLAIMED", claimedAt: new Date() },
    });
  });

  let badgeUnlocked: string | null = null;
  if (rewards.badgeCode) {
    const badge = await prisma.badge.findFirst({
      where: { code: rewards.badgeCode },
    });
    if (badge) {
      const had = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: { userId, badgeId: badge.id },
        },
      });
      if (!had) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
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
        }).catch(() => {});
        badgeUnlocked = badge.name;
      }
    }
  }

  return { credits, xp, badgeUnlocked };
}

/**
 * Get multiplier for mission rewards from user's badges (Streak 3/7/30).
 */
async function getMissionRewardMultiplier(
  prisma: PrismaClient,
  userId: string
): Promise<number> {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: { select: { code: true, effect: true } } },
  });

  let multiplier = 1;
  for (const ub of userBadges) {
    if (!ub.badge.effect) continue;
    try {
      const effect = JSON.parse(ub.badge.effect) as {
        type: string;
        value?: number;
      };
      if (effect.type === "BONUS_MULTIPLIER" && typeof effect.value === "number") {
        multiplier = Math.max(multiplier, 1 + effect.value);
      }
    } catch {
      /* ignore */
    }
  }
  return multiplier;
}
