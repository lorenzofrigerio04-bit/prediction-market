import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getNextDailyBonusAmount,
  getDailyBonusMultiplier,
} from "@/lib/credits-config";

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

    // Controlla se può prendere il daily bonus oggi
    const currentDate = new Date();
    // lastDailyBonus non esiste nello schema - sempre permettere bonus
    const canClaimDailyBonus = true;
    const nextBonusAmount = getNextDailyBonusAmount(      user.streakCount,
      canClaimDailyBonus
    );
    const bonusMultiplier = getDailyBonusMultiplier(user.streakCount);

    const todayStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), 0, 0, 0, 0));
    const canSpinToday = true; // dailySpin non implementato
    const hasActiveBoost = false; // boostExpiresAt e boostMultiplier non esistono nello schema

    return NextResponse.json({
      credits: user.credits,
      totalEarned: user.totalEarned,
      streakCount: user.streakCount,
      canClaimDailyBonus,
      nextBonusAmount,
      bonusMultiplier,
      canSpinToday,
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
