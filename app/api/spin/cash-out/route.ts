import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";

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

    const pending = await prisma.transaction.findFirst({
      where: {
        userId,
        type: "SPIN_PENDING",
        createdAt: { gte: todayStart },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "Nessun premio in sospeso da incassare" },
        { status: 400 }
      );
    }

    const alreadyCashed = await prisma.transaction.findFirst({
      where: {
        userId,
        type: "SPIN_REWARD",
        referenceId: pending.id,
      },
    });

    if (alreadyCashed) {
      return NextResponse.json(
        { error: "Premio già incassato" },
        { status: 400 }
      );
    }

    const amount = Math.abs(pending.amount);

    await prisma.$transaction(async (tx) => {
      await applyCreditTransaction(tx, userId, "SPIN_REWARD", amount, {
        referenceId: pending.id,
        referenceType: "spin_pending",
      });
    });

    return NextResponse.json({ success: true, credits: amount });
  } catch (error) {
    console.error("Error cashing out spin:", error);
    return NextResponse.json(
      { error: "Errore durante l'incasso" },
      { status: 500 }
    );
  }
}
