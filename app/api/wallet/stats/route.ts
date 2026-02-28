import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDisplayCredits } from "@/lib/credits-config";

export const dynamic = "force-dynamic";

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
        creditsMicros: true,
        totalEarned: true,
        streakCount: true,
      },
    });


    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

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
    const canClaimDailyBonus = canSpinToday;
    const nextBonusAmount = canSpinToday ? 50 : 0;
    const todaySpinCredits = spinToday ? spinToday.amount : null;
    const hasActiveBoost = false; // boostExpiresAt e boostMultiplier non esistono nello schema

    const totalSpentResult = await prisma.transaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 },
      },
      _sum: { amount: true },
    });
    const totalSpent = Math.abs(totalSpentResult._sum.amount ?? 0);

    const credits = getDisplayCredits({
      credits: user.credits,
      creditsMicros: user.creditsMicros,
    });
    return NextResponse.json({
      credits,
      creditsMicros: user.creditsMicros != null ? user.creditsMicros.toString() : null,
      totalEarned: user.totalEarned,
      totalSpent,
      streak: user.streakCount ?? 0,
      streakCount: user.streakCount,
      canClaimDailyBonus,
      nextBonusAmount,
      canSpinToday,
      todaySpinCredits,
      boostMultiplier: 0,
      boostExpiresAt: null,
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
