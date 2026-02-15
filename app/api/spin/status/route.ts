import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDayUTC } from "@/lib/spin-utils";
import type { DailySpinCreditsPayload } from "@/lib/spin-config";

export const dynamic = "force-dynamic";

function nextSpinAtUTC(): Date {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return startOfDayUTC(tomorrow);
}

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
    const now = new Date();
    const todayStart = startOfDayUTC(now);

    const lastSpin = await prisma.dailySpin.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, rewardType: true, rewardPayload: true },
    });

    const canSpin = !lastSpin || new Date(lastSpin.createdAt) < todayStart;
    const isTodaySpin =
      lastSpin && new Date(lastSpin.createdAt) >= todayStart;

    let pendingCredits: number | null = null;
    let payloadStatus: string | null = null;

    if (isTodaySpin && lastSpin?.rewardType === "CREDITS" && lastSpin.rewardPayload) {
      const payload = lastSpin.rewardPayload as unknown as DailySpinCreditsPayload;
      payloadStatus = payload.status;
      if (payload.status === "PENDING_CHOICE" && payload.amount > 0) {
        pendingCredits = payload.amount;
      }
    }

    return NextResponse.json({
      canSpin,
      lastSpinAt: lastSpin?.createdAt ?? null,
      nextSpinAt: canSpin ? null : nextSpinAtUTC().toISOString(),
      pendingCredits,
      payloadStatus,
    });
  } catch (error) {
    console.error("Error fetching spin status:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dello stato dello spin" },
      { status: 500 }
    );
  }
}
