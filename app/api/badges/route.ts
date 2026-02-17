import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/badges
 * Restituisce tutti i badge con stato sbloccato/non sbloccato per l'utente corrente.
 */
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

    const [allBadges, userBadges] = await Promise.all([
      prisma.badge.findMany({
        orderBy: { rarity: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          rarity: true,
        },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        select: {
          badgeId: true,
          unlockedAt: true,
        },
      }),
    ]);

    const userBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    const badgesWithStatus = allBadges.map((badge) => ({
      ...badge,
      unlocked: userBadgeIds.has(badge.id),
      unlockedAt: userBadges.find((ub) => ub.badgeId === badge.id)?.unlockedAt || null,
    }));

    return NextResponse.json(badgesWithStatus);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei badge" },
      { status: 500 }
    );
  }
}
