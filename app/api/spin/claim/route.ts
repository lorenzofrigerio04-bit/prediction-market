import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pickSpinReward, getRewardIndex, type WeightedReward } from "@/lib/spin-config";

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const lastSpin = await prisma.dailySpin.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const now = new Date();
    const todayStart = startOfDayUTC(now);
    const canSpin = !lastSpin || new Date(lastSpin.createdAt) < todayStart;

    if (!canSpin) {
      return NextResponse.json(
        { error: "Hai già usato lo spin gratuito di oggi. Torna domani!" },
        { status: 400 }
      );
    }

    const weighted: WeightedReward = pickSpinReward();
    const reward = weighted.reward;

    const result = await prisma.$transaction(async (tx) => {
      await tx.dailySpin.create({
        data: {
          userId,
          rewardType: "BOOST",
          rewardPayload: {
            multiplier: reward.multiplier,
            durationMinutes: reward.durationMinutes,
          },
        },
      });

      const expiresAt = new Date(now.getTime() + reward.durationMinutes * 60 * 1000);
      await tx.user.update({
        where: { id: userId },
        data: {
          boostMultiplier: reward.multiplier,
          boostExpiresAt: expiresAt,
        },
      });
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true, boostMultiplier: true, boostExpiresAt: true },
      });
      return {
        reward: weighted,
        newCredits: user?.credits ?? 0,
        boostMultiplier: user?.boostMultiplier ?? null,
        boostExpiresAt: user?.boostExpiresAt?.toISOString() ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      reward: {
        kind: "BOOST",
        label: result.reward.label,
        multiplier: result.reward.reward.multiplier,
        durationMinutes: result.reward.reward.durationMinutes,
      },
      rewardIndex: getRewardIndex(result.reward),
      newCredits: result.newCredits,
      boostMultiplier: result.boostMultiplier,
      boostExpiresAt: result.boostExpiresAt,
    });
  } catch (error) {
    console.error("Error claiming spin:", error);
    return NextResponse.json(
      { error: "Errore durante lo spin" },
      { status: 500 }
    );
  }
}
