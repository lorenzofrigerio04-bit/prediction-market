import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { track } from "@/lib/analytics";
import {
  DAILY_BONUS_BASE,
  getNextDailyBonusAmount,
} from "@/lib/credits-config";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Ottieni l'utente con le informazioni necessarie
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        streakCount: true,
        // lastDailyBonus non esiste nello schema - rimosso true,
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

    const alreadyClaimedToday = await prisma.transaction.findFirst({
      where: {
        userId,
        type: "DAILY_BONUS",
        createdAt: { gte: todayStart },
      },
    });

    if (alreadyClaimedToday) {
      return NextResponse.json(
        { error: "Hai già riscattato il bonus giornaliero oggi" },
        { status: 400 }
      );
    }
    // Semplificato: incrementa sempre lo streak (da migliorare con controllo su Transaction)
    const newStreak = (user.streakCount || 0) + 1;
    const bonusAmount = getNextDailyBonusAmount(user.streakCount, true);
    const multiplier = (bonusAmount / DAILY_BONUS_BASE).toFixed(1);
    const { newCredits, newStreak: streakCount } = await prisma.$transaction(async (tx) => {
      const newCredits = await applyCreditTransaction(
        tx,
        userId,
        "DAILY_BONUS",
        bonusAmount,
        {
          description: `Bonus giornaliero (Serie: ${newStreak} giorni, x${multiplier})`,
        }
      );
      await tx.user.update({
        where: { id: userId },
        data: { streakCount: newStreak },
      });
      const userAfter = await tx.user.findUnique({
        where: { id: userId },
        select: { streakCount: true },
      });
      return { newCredits, newStreak: userAfter!.streakCount };
    });

    // Missione "Login giornaliero" e badge (streak può aver sbloccato badge)
    updateMissionProgress(prisma, userId, "DAILY_LOGIN", 1).catch((e) =>
      console.error("Mission progress update error:", e)
    );
    checkAndAwardBadges(prisma, userId).catch((e) =>
      console.error("Badge check error:", e)
    );

    track(
      "DAILY_BONUS_CLAIMED",
      { userId, amount: bonusAmount, period: "daily", streakCount: newStreak },
      { request }
    );

    return NextResponse.json({
      success: true,
      bonusAmount,
      newCredits,
      newStreak: streakCount,
    });
  } catch (error) {
    console.error("Error claiming daily bonus:", error);
    return NextResponse.json(
      { error: "Errore nel riscatto del bonus giornaliero" },
      { status: 500 }
    );
  }
}
