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

    // Calcola il prossimo bonus (base + streak * moltiplicatore)
    const DAILY_BONUS_BASE = 100;
    const STREAK_MULTIPLIER = 10;
    const nextBonusAmount =
      DAILY_BONUS_BASE + user.streak * STREAK_MULTIPLIER;

    return NextResponse.json({
      credits: user.credits,
      totalEarned: user.totalEarned,
      totalSpent: user.totalSpent,
      streak: user.streak,
      lastDailyBonus: user.lastDailyBonus,
      canClaimDailyBonus,
      nextBonusAmount,
    });
  } catch (error) {
    console.error("Error fetching wallet stats:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle statistiche del wallet" },
      { status: 500 }
    );
  }
}
