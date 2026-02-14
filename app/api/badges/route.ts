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
        orderBy: [
          { rarity: "asc" },
          { name: "asc" },
        ],
      }),
      prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true, unlockedAt: true },
      }),
    ]);

    const unlockedMap = new Map(
      userBadges.map((ub) => [ub.badgeId, ub.unlockedAt])
    );

    const badges = allBadges.map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      rarity: badge.rarity,
      unlocked: unlockedMap.has(badge.id),
      unlockedAt: unlockedMap.get(badge.id) ?? null,
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei badge" },
      { status: 500 }
    );
  }
}
