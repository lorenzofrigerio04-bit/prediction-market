import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { track } from "@/lib/analytics";

// Bonus giornaliero base (es. 50)
const DAILY_BONUS_BASE = 50;
// Moltiplicatore streak: 1 + 0.1 per giorno, max 2x
const STREAK_MULTIPLIER_PER_DAY = 0.1;
const STREAK_CAP_FOR_MULTIPLIER = 10; // 10 giorni = 2x

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

    // Controlla se ha già preso il bonus oggi
    const now = new Date();
    const lastBonusDate = user.lastDailyBonus
      ? new Date(user.lastDailyBonus)
      : null;

    // Verifica se è lo stesso giorno (confronta solo data, non ora)
    const isSameDay =
      lastBonusDate &&
      lastBonusDate.getFullYear() === now.getFullYear() &&
      lastBonusDate.getMonth() === now.getMonth() &&
      lastBonusDate.getDate() === now.getDate();

    if (isSameDay) {
      return NextResponse.json(
        { error: "Hai già riscattato il bonus giornaliero oggi" },
        { status: 400 }
      );
    }

    // Calcola il nuovo streak (prima, per applicare il moltiplicatore al bonus)
    let newStreak = 1; // Se non ha mai preso il bonus, inizia da 1
    if (lastBonusDate) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      // Confronta solo la data (senza l'ora)
      const lastBonusDateOnly = new Date(
        lastBonusDate.getFullYear(),
        lastBonusDate.getMonth(),
        lastBonusDate.getDate()
      );
      const yesterdayOnly = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate()
      );

      if (lastBonusDateOnly.getTime() === yesterdayOnly.getTime()) {
        // Ha preso il bonus ieri, incrementa lo streak
        newStreak = user.streak + 1;
      } else {
        // Non ha preso il bonus ieri, reset streak
        newStreak = 1;
      }
    }

    // Moltiplicatore: 1 + 0.1 per giorno, max 2x
    const multiplier = Math.min(
      2,
      1 + Math.min(newStreak, STREAK_CAP_FOR_MULTIPLIER) * STREAK_MULTIPLIER_PER_DAY
    );
    const bonusAmount = Math.round(DAILY_BONUS_BASE * multiplier);

    // Aggiorna l'utente e crea la transazione in una transazione atomica
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Aggiorna crediti, streak e lastDailyBonus
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: bonusAmount,
          },
          streak: newStreak,
          lastDailyBonus: now,
          totalEarned: {
            increment: bonusAmount,
          },
        },
        select: {
          credits: true,
          streak: true,
        },
      });

      // Crea la transazione
      await tx.transaction.create({
        data: {
          userId,
          type: "DAILY_BONUS",
          amount: bonusAmount,
          description: `Bonus giornaliero (Serie: ${newStreak} giorni, x${multiplier.toFixed(1)})`,
          referenceType: "daily_bonus",
          balanceAfter: updated.credits,
        },
      });

      return updated;
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
      { userId, amount: bonusAmount, period: "daily", streak: newStreak },
      { request }
    );

    return NextResponse.json({
      success: true,
      bonusAmount,
      newCredits: updatedUser.credits,
      newStreak: updatedUser.streak,
      message: `Hai ricevuto ${bonusAmount} crediti! Streak: ${updatedUser.streak} giorni`,
    });
  } catch (error) {
    console.error("Error claiming daily bonus:", error);
    return NextResponse.json(
      { error: "Errore nel riscatto del bonus giornaliero" },
      { status: 500 }
    );
  }
}
