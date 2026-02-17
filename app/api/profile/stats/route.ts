import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Fetch predictions stats
    const [activePredictions, wonPredictions, lostPredictions] = await Promise.all([
      prisma.prediction.count({
        where: {
          userId,
          resolved: false,
        },
      }),
      prisma.prediction.count({
        where: {
          userId,
          resolved: true,
          won: true,
        },
      }),
      prisma.prediction.count({
        where: {
          userId,
          resolved: true,
          won: false,
        },
      }),
    ]);

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

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      stats: {
        credits: user.credits,
        totalEarned: user.totalEarned,
        totalSpent,
        streak: user.streakCount,
        activePredictions,
        wonPredictions,
        lostPredictions,
        roi: Math.round(roi * 100) / 100, // Round to 2 decimal places
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
