import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";

// Bonus giornaliero base
const DAILY_BONUS_BASE = 100;
// Bonus moltiplicatore per streak
const STREAK_MULTIPLIER = 10; // +10 crediti per ogni giorno di streak

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

    // Calcola il bonus (base + moltiplicatore streak)
    const bonusAmount =
      DAILY_BONUS_BASE + user.streak * STREAK_MULTIPLIER;

    // Calcola il nuovo streak
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
          description: `Bonus giornaliero (Streak: ${newStreak} giorni)`,
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
