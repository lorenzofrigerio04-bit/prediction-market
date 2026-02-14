import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Controlla se può prendere il daily bonus oggi
    const now = new Date();
    const lastBonusDate = user.lastDailyBonus
      ? new Date(user.lastDailyBonus)
      : null;

    const canClaimDailyBonus =
      !lastBonusDate ||
      lastBonusDate.getFullYear() !== now.getFullYear() ||
      lastBonusDate.getMonth() !== now.getMonth() ||
      lastBonusDate.getDate() !== now.getDate();

    // Moltiplicatore bonus: 1 + 0.1 per giorno, max 2x (stesso giorno = streak già valido per domani)
    const STREAK_MULTIPLIER_PER_DAY = 0.1;
    const STREAK_CAP = 10;
    const DAILY_BONUS_BASE = 50;
    // Moltiplicatore al prossimo claim (se può claimare ora: streak+1, altrimenti per "domani" non applicabile qui)
    const nextMultiplier = Math.min(
      2,
      1 + Math.min(user.streak + (canClaimDailyBonus ? 1 : 0), STREAK_CAP) * STREAK_MULTIPLIER_PER_DAY
    );
    const nextBonusAmount = Math.round(DAILY_BONUS_BASE * nextMultiplier);
    // Moltiplicatore basato sulla serie attuale (per UI "Moltiplicatore bonus: x1.2")
    const bonusMultiplier = Math.min(2, 1 + Math.min(user.streak, STREAK_CAP) * STREAK_MULTIPLIER_PER_DAY);

    return NextResponse.json({
      credits: user.credits,
      totalEarned: user.totalEarned,
      totalSpent: user.totalSpent,
      streak: user.streak,
      lastDailyBonus: user.lastDailyBonus,
      canClaimDailyBonus,
      nextBonusAmount,
      bonusMultiplier: Math.round(bonusMultiplier * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching wallet stats:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle statistiche del wallet" },
      { status: 500 }
    );
  }
}
