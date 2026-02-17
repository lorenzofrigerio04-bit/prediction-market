import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pickFirstSpinCredits, getCreditsSegmentIndex } from "@/lib/spin-config";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

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
    const todayStart = startOfToday();

    const [existingPending, cashedToday] = await Promise.all([
      prisma.transaction.findFirst({
        where: {
          userId,
          type: "SPIN_PENDING",
          createdAt: { gte: todayStart },
        },
      }),
      prisma.transaction.findFirst({
        where: {
          userId,
          type: "SPIN_REWARD",
          createdAt: { gte: todayStart },
        },
      }),
    ]);

    if (cashedToday) {
      return NextResponse.json(
        { error: "Hai già usato la ruota oggi. Torna domani." },
        { status: 400 }
      );
    }

    if (existingPending) {
      const cashed = await prisma.transaction.findFirst({
        where: {
          userId,
          type: "SPIN_REWARD",
          referenceId: existingPending.id,
        },
      });
      if (!cashed) {
        return NextResponse.json(
          { error: "Hai già un premio in sospeso. Incassa o prova il moltiplicatore." },
          { status: 400 }
        );
      }
    }

    const segment = pickFirstSpinCredits();
    const segmentIndex = getCreditsSegmentIndex(segment.credits);

    await prisma.transaction.create({
      data: {
        userId,
        type: "SPIN_PENDING",
        amount: segment.credits,
        referenceId: null,
      },
    });

    return NextResponse.json({
      credits: segment.credits,
      segmentIndex,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Errore durante lo spin" },
      { status: 500 }
    );
  }
}
