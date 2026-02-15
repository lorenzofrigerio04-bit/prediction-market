import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  pickFirstSpinCredits,
  getCreditsSegmentIndex,
  type DailySpinCreditsPayload,
} from "@/lib/spin-config";
import { startOfDayUTC } from "@/lib/spin-utils";

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

    const lastSpin = await prisma.dailySpin.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const canSpin = !lastSpin || new Date(lastSpin.createdAt) < todayStart;

    if (!canSpin) {
      return NextResponse.json(
        { error: "Hai già usato lo spin di oggi. Torna domani." },
        { status: 400 }
      );
    }

    const segment = pickFirstSpinCredits();
    const payload: DailySpinCreditsPayload = {
      amount: segment.credits,
      status: segment.credits === 0 ? "CASHED" : "PENDING_CHOICE",
    };

    await prisma.dailySpin.create({
      data: {
        userId,
        rewardType: "CREDITS",
        rewardPayload: payload as unknown as object,
      },
    });

    const segmentIndex = getCreditsSegmentIndex(segment.credits);

    return NextResponse.json({
      success: true,
      credits: segment.credits,
      segmentIndex,
      status: payload.status,
    });
  } catch (error) {
    console.error("Error claiming spin:", error);
    return NextResponse.json(
      { error: "Errore durante lo spin" },
      { status: 500 }
    );
  }
}
