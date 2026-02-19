import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Statistiche per la landing: utenti totali (inclusi bot) e eventi attivi (aperti, non risolti).
 * Usato per i contatori "live" sotto l'hero.
 */
export async function GET() {
  try {
    const now = new Date();

    const [usersCount, activeEventsCount] = await Promise.all([
      prisma.user.count(),
      prisma.event.count({
        where: {
          resolved: false,
          closesAt: { gt: now },
        },
      }),
    ]);

    return NextResponse.json({
      usersCount,
      activeEventsCount,
    });
  } catch (e) {
    console.error("landing-stats error:", e);
    return NextResponse.json(
      { usersCount: 0, activeEventsCount: 0 },
      { status: 200 }
    );
  }
}
