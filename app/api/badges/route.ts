import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Ordine di possibilità di conseguimento: dai più facili ai più difficili */
const ACHIEVEMENT_ORDER = [
  "Primo evento",
  "Prima previsione",
  "Apprendista",
  "Veggente",
  "Oracolo",
  "Prima vittoria",
  "Vincente",
  "Streak 3 giorni",
  "Streak 7 giorni",
  "Streak 30 giorni",
  "Precisione 60%",
  "Precisione 80%",
];

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

    badgesWithStatus.sort((a, b) => {
      const i = ACHIEVEMENT_ORDER.indexOf(a.name);
      const j = ACHIEVEMENT_ORDER.indexOf(b.name);
      const orderA = i === -1 ? ACHIEVEMENT_ORDER.length : i;
      const orderB = j === -1 ? ACHIEVEMENT_ORDER.length : j;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(badgesWithStatus);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei badge" },
      { status: 500 }
    );
  }
}
