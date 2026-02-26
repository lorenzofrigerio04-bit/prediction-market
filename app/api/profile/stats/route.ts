import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDisplayCredits } from "@/lib/credits-config";

export const dynamic = "force-dynamic";

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

    // Fetch user with basic stats, badges and followed events
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        credits: true,
        creditsMicros: true,
        totalEarned: true,
        streakCount: true,
        createdAt: true,
        userBadges: {
          select: {
            unlockedAt: true,
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                rarity: true,
              },
            },
          },
        },
        eventFollows: {
          select: {
            event: {
              select: {
                id: true,
                title: true,
                closesAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Count events created by user
    const eventsCreatedCount = await prisma.event.count({
      where: { createdById: userId },
    });

    // Previsioni: da Position (AMM). Ogni posizione = una previsione su un evento.
    const [totalPredictions, activePredictions, wonYes, wonNo, resolvedCount] = await Promise.all([
      prisma.position.count({ where: { userId } }),
      prisma.position.count({ where: { userId, event: { resolved: false } } }),
      prisma.position.count({
        where: { userId, event: { resolved: true, outcome: "YES" }, yesShareMicros: { gt: 0 } },
      }),
      prisma.position.count({
        where: { userId, event: { resolved: true, outcome: "NO" }, noShareMicros: { gt: 0 } },
      }),
      prisma.position.count({ where: { userId, event: { resolved: true } } }),
    ]);
    const wonPredictions = wonYes + wonNo;
    const lostPredictions = resolvedCount - wonPredictions;

    // Calculate total spent from transactions (negative amounts)
    const totalSpentResult = await prisma.transaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 },
      },
      _sum: {
        amount: true,
      },
    });
    const totalSpent = Math.abs(totalSpentResult._sum.amount || 0);

    // Calculate ROI (Return on Investment)
    const totalInvested = totalSpent;
    const totalReturn = user.totalEarned;
    const roi = totalInvested > 0 
      ? ((totalReturn - totalInvested) / totalInvested) * 100 
      : 0;

    const correctPredictions = wonPredictions;
    const accuracy =
      totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.name ?? null,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      stats: {
        credits: getDisplayCredits({
          credits: user.credits,
          creditsMicros: user.creditsMicros,
        }),
        totalEarned: user.totalEarned,
        totalSpent,
        streak: user.streakCount ?? 0,
        activePredictions,
        wonPredictions,
        lostPredictions,
        totalPredictions,
        correctPredictions,
        accuracy: Math.round(accuracy * 100) / 100,
        roi: Math.round(roi * 100) / 100,
        eventsCreatedCount,
      },
      badges: user.userBadges.map((ub) => ({
        ...ub.badge,
        unlockedAt: ub.unlockedAt,
      })),
      followedEventsCount: user.eventFollows.length,
      followedEvents: user.eventFollows.map((ef) => ef.event),
    });
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle statistiche del profilo" },
      { status: 500 }
    );
  }
}
