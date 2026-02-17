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

    const [pendingTx, cashedToday] = await Promise.all([
      prisma.transaction.findFirst({
        where: {
          userId,
          type: "SPIN_PENDING",
          createdAt: { gte: todayStart },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.findFirst({
        where: {
          userId,
          type: "SPIN_REWARD",
          createdAt: { gte: todayStart },
        },
      }),
    ]);

    const pendingId = pendingTx?.id;
    const alreadyCashed = pendingId
      ? await prisma.transaction.findFirst({
          where: {
            userId,
            type: "SPIN_REWARD",
            referenceId: pendingId,
          },
        })
      : null;

    const hasUncashedPending = !!pendingTx && !alreadyCashed;
    const canSpin = !hasUncashedPending && !cashedToday;
    const pendingCredits = hasUncashedPending ? Math.abs(pendingTx!.amount) : null;

    return NextResponse.json({
      canSpin,
      lastSpinAt: pendingTx?.createdAt?.toISOString() ?? null,
      nextSpinAt: null,
      pendingCredits,
      payloadStatus: hasUncashedPending ? "PENDING_CHOICE" : null,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Errore" },
      { status: 500 }
    );
  }
}
