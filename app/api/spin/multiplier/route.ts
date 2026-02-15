import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";
import { CREDIT_TRANSACTION_TYPES } from "@/lib/credits-config";
import { startOfDayUTC } from "@/lib/spin-utils";
import { pickMultiplier, getMultiplierSegmentIndex, type DailySpinCreditsPayload } from "@/lib/spin-config";

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
    const now = new Date();
    const todayStart = startOfDayUTC(now);

    const todaySpin = await prisma.dailySpin.findFirst({
      where: { userId, rewardType: "CREDITS" },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, rewardPayload: true },
    });

    if (!todaySpin || new Date(todaySpin.createdAt) < todayStart) {
      return NextResponse.json(
        { error: "Nessuno spin in sospeso oggi." },
        { status: 400 }
      );
    }

    const payload = todaySpin.rewardPayload as unknown as DailySpinCreditsPayload;

    if (payload.status !== "PENDING_CHOICE" || payload.amount <= 0) {
      return NextResponse.json(
        { error: "Nessuna scelta in sospeso o importo non valido." },
        { status: 400 }
      );
    }

    const baseCredits = payload.amount;
    const segment = pickMultiplier();
    const multiplier = segment.multiplier;
    const totalCredits = Math.round(baseCredits * multiplier);
    const segmentIndex = getMultiplierSegmentIndex(multiplier);

    await prisma.$transaction(async (tx) => {
      await applyCreditTransaction(
        tx,
        userId,
        CREDIT_TRANSACTION_TYPES.SPIN_REWARD,
        totalCredits,
        { applyBoost: false }
      );
      await tx.dailySpin.update({
        where: { id: todaySpin.id },
        data: {
          rewardPayload: {
            ...payload,
            status: "MULTIPLIED",
            multiplierUsed: multiplier,
          } as unknown as object,
        },
      });
    });

    return NextResponse.json({
      success: true,
      multiplier,
      baseCredits,
      totalCredits,
      segmentIndex,
    });
  } catch (error) {
    console.error("Error applying multiplier spin:", error);
    return NextResponse.json(
      { error: "Errore durante la ruota moltiplicatrice" },
      { status: 500 }
    );
  }
}
