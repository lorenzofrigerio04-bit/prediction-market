import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Restituisce l'inizio del giorno in UTC (00:00:00) per la data data. */
function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/** Prossimo momento in cui può fare spin (inizio del giorno successivo UTC). */
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

    const lastSpin = await prisma.dailySpin.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const now = new Date();
    const todayStart = startOfDayUTC(now);
    const canSpin = !lastSpin || new Date(lastSpin.createdAt) < todayStart;

    return NextResponse.json({
      canSpin,
      lastSpinAt: lastSpin?.createdAt ?? null,
      nextSpinAt: canSpin ? null : nextSpinAtUTC().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching spin status:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dello stato dello spin" },
      { status: 500 }
    );
  }
}
