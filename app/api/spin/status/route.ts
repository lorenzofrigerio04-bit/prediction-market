import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
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
    const todayStart = startOfToday();

    const [spinToday, user] = await Promise.all([
      prisma.transaction.findFirst({
        where: {
          userId,
          type: "SPIN_REWARD",
          createdAt: { gte: todayStart },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { streakCount: true },
      }),
    ]);

    const canSpin = !spinToday;
    const streak = user?.streakCount ?? 0;

    return NextResponse.json({
      canSpin,
      lastSpinAt: spinToday?.createdAt?.toISOString() ?? null,
      nextSpinAt: null,
      pendingCredits: null,
      payloadStatus: null,
      streak,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Errore" },
      { status: 500 }
    );
  }
}
