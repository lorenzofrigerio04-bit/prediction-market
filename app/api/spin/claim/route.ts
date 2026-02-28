import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pickFirstSpinCredits, getCreditsSegmentIndex } from "@/lib/spin-config";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";
import { updateMissionProgress } from "@/lib/missions";
import { handleMissionEvent } from "@/lib/missions/mission-progress-service";
import { checkAndAwardBadges } from "@/lib/badges";
import { track } from "@/lib/analytics";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Bonus giornaliero = ruota. Un giro al giorno, risultato = segmento (nessun moltiplicatore).
 * Lo spin non dà mai 0 crediti (min 1). La streak resta solo come indicatore visivo.
 */
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
    const todayStart = startOfToday();

    const alreadySpunToday = await prisma.transaction.findFirst({
      where: {
        userId,
        type: "SPIN_REWARD",
        createdAt: { gte: todayStart },
      },
    });

    if (alreadySpunToday) {
      return NextResponse.json(
        { error: "Hai già usato la ruota oggi. Torna domani." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true },
    });
    const currentStreak = user?.streakCount ?? 0;
    const segment = pickFirstSpinCredits();
    const segmentIndex = getCreditsSegmentIndex(segment.credits);
    const finalCredits = Math.max(1, segment.credits);
    const newStreak = currentStreak + 1;

    await prisma.$transaction(async (tx) => {
      await applyCreditTransaction(tx, userId, "SPIN_REWARD", finalCredits, {
        description: `Bonus giornaliero (ruota): ${finalCredits} crediti`,
      });
      await tx.user.update({
        where: { id: userId },
        data: { streakCount: newStreak },
      });
    });

    updateMissionProgress(prisma, userId, "DAILY_LOGIN", 1).catch((e) =>
      console.error("Mission progress update error:", e)
    );
    handleMissionEvent(prisma, userId, "LOGIN_STREAK_DAYS", { streak: newStreak }).catch((e) =>
      console.error("Mission event (login streak) error:", e)
    );
    checkAndAwardBadges(prisma, userId).catch((e) =>
      console.error("Badge check error:", e)
    );

    track(
      "DAILY_BONUS_CLAIMED",
      { userId, amount: finalCredits, period: "daily", streakCount: newStreak, source: "spin" },
      { request }
    );

    return NextResponse.json({
      credits: finalCredits,
      segmentIndex,
      newStreak,
    });
  } catch (error) {
    console.error("Error claiming spin:", error);
    return NextResponse.json(
      { error: "Errore durante lo spin" },
      { status: 500 }
    );
  }
}
