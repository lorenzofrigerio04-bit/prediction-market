import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Fetch user with basic stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        credits: true,
        totalEarned: true,
        totalSpent: true,
        streak: true,
        totalPredictions: true,
        correctPredictions: true,
        accuracy: true,
        createdAt: true,
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

    // Fetch badges
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
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
      orderBy: {
        unlockedAt: "desc",
      },
    });

    // Calculate ROI (Return on Investment)
    const totalInvested = user.totalSpent;
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
        totalSpent: user.totalSpent,
        streak: user.streak,
        accuracy: user.accuracy,
        totalPredictions: user.totalPredictions,
        correctPredictions: user.correctPredictions,
        activePredictions,
        wonPredictions,
        lostPredictions,
        roi: Math.round(roi * 100) / 100, // Round to 2 decimal places
      },
      badges: badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        rarity: ub.badge.rarity,
        unlockedAt: ub.unlockedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle statistiche del profilo" },
      { status: 500 }
    );
  }
}
