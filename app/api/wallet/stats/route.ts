import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getNextDailyBonusAmount,
  getDailyBonusMultiplier,
} from "@/lib/credits-config";

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        totalEarned: true,
        totalSpent: true,
        streak: true,
        lastDailyBonus: true,
        boostMultiplier: true,
        boostExpiresAt: true,
      },
    });

    const lastSpin = await prisma.dailySpin.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Controlla se può prendere il daily bonus oggi
    const currentDate = new Date();
    const lastBonusDate = user.lastDailyBonus
      ? new Date(user.lastDailyBonus)
      : null;

    const canClaimDailyBonus =
      !lastBonusDate ||
      lastBonusDate.getFullYear() !== currentDate.getFullYear() ||
      lastBonusDate.getMonth() !== currentDate.getMonth() ||
      lastBonusDate.getDate() !== currentDate.getDate();

    const nextBonusAmount = getNextDailyBonusAmount(
      user.streak,
      canClaimDailyBonus
    );
    const bonusMultiplier = getDailyBonusMultiplier(user.streak);

    const todayStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), 0, 0, 0, 0));
    const canSpinToday =
      !lastSpin || new Date(lastSpin.createdAt) < todayStart;
    const hasActiveBoost =
      user.boostExpiresAt != null &&
      currentDate < user.boostExpiresAt &&
      (user.boostMultiplier ?? 0) > 1;

    return NextResponse.json({
      credits: user.credits,
      totalEarned: user.totalEarned,
      totalSpent: user.totalSpent,
      streak: user.streak,
      lastDailyBonus: user.lastDailyBonus,
      canClaimDailyBonus,
      nextBonusAmount,
      bonusMultiplier,
      canSpinToday,
      boostMultiplier: user.boostMultiplier,
      boostExpiresAt: user.boostExpiresAt,
      hasActiveBoost,
    });
  } catch (error) {
    console.error("Error fetching wallet stats:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle statistiche del wallet" },
      { status: 500 }
    );
  }
}
