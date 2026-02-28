import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const bodyBase = Number(body.baseCredits) || 0;

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
        { error: "Nessun premio in sospeso. Fai prima un giro alla ruota crediti." },
        { status: 400 }
      );
    }

    const baseCredits = Math.abs(pending.amount);
    if (bodyBase > 0 && bodyBase !== baseCredits) {
      return NextResponse.json(
        { error: "Importo non corrispondente al premio in sospeso" },
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
        { error: "Hai già incassato o moltiplicato questo premio" },
        { status: 400 }
      );
    }

    // Moltiplicatore rimosso: incasso = base (equivalente a multiplier 1)
    const multiplier = 1;
    const totalCredits = baseCredits;

    await prisma.$transaction(async (tx) => {
      await applyCreditTransaction(tx, userId, "SPIN_REWARD", totalCredits, {
        referenceId: pending.id,
        referenceType: "spin_pending",
      });
    });

    return NextResponse.json({
      multiplier,
      baseCredits,
      totalCredits,
      segmentIndex: 0,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Errore ruota moltiplicatrice" },
      { status: 500 }
    );
  }
}
