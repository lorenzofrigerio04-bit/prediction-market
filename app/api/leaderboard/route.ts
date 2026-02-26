import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PeriodType = "daily" | "weekly" | "monthly" | "all-time";

interface LeaderboardBadge {
  id: string;
  name: string;
  icon: string | null;
  rarity: string;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  roi: number;
  streak: number;
  score: number;
  totalEarned: number;
  totalSpent: number;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  badges: LeaderboardBadge[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "all-time") as PeriodType;
    const category = searchParams.get("category") || null;

    // Calculate date range based on period
    let startDate: Date | null = null;
    const now = new Date();

    if (period === "daily") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }
    // For "all-time", startDate remains null

    // Fetch all users with their stats
    const users = await prisma.user.findMany({
      where: {
        // Only include users who have made at least one prediction
        Prediction: {
          some: {}
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        streakCount: true,
        totalEarned: true,
      },
    });

    // Calculate ROI and filter predictions by period if needed
    const leaderboardData: LeaderboardUser[] = await Promise.all(
      users.map(async (user) => {
        let periodStats = {
          totalEarned: 0,
          totalSpent: 0,
          totalPredictions: 0,
          correctPredictions: 0,
          accuracy: 0,
        };

        // Fetch predictions based on period and category filters
        const periodPredictions = await prisma.prediction.findMany({
          where: {
            userId: user.id,
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(category && { event: { category } }),
          },
          select: {
            credits: true,
            won: true,
            payout: true,
            resolved: true,
          },
        });

        periodStats.totalPredictions = periodPredictions.length;
        periodStats.correctPredictions = periodPredictions.filter(
          (p) => p.resolved && p.won === true
        ).length;

        // Calculate period-specific earnings and spending
        periodStats.totalSpent = periodPredictions.reduce(
          (sum, p) => sum + p.credits,
          0
        );
        periodStats.totalEarned = periodPredictions
          .filter((p) => p.resolved && p.won === true && p.payout)
          .reduce((sum, p) => sum + (p.payout || 0), 0);

        // Calculate accuracy for the period
        const periodAccuracy =
          periodStats.totalPredictions > 0
            ? (periodStats.correctPredictions / periodStats.totalPredictions) * 100
            : 0;
        periodStats.accuracy = periodAccuracy;

        // Calculate ROI for the period
        const roi =
          periodStats.totalSpent > 0
            ? ((periodStats.totalEarned - periodStats.totalSpent) /
                periodStats.totalSpent) *
              100
            : 0;

        return {
          rank: 0, // filled after sort in rankedData
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          roi: Math.round(roi * 100) / 100,
          streak: user.streakCount,
          score: 0, // filled below
          totalEarned: periodStats.totalEarned,
          totalSpent: periodStats.totalSpent,
          accuracy: periodStats.accuracy,
          totalPredictions: periodStats.totalPredictions,
          correctPredictions: periodStats.correctPredictions,
          badges: [], // filled below
        };
      })
    );

    // Filter out users with no predictions in the period or zero score
    const filteredData = leaderboardData.filter((user) => {
      return user.totalPredictions > 0 && (user.totalSpent > 0 || user.totalEarned > 0);
    });

    // Sort by performance score (weighted combination of accuracy, ROI, and streak)
    const normalizedData = filteredData.map((user) => {
      const normalizedROI = Math.max(0, Math.min(100, (user.roi + 100) / 6));
      const normalizedStreak = Math.min(100, user.streak * 5);
      const score =
        user.accuracy * 0.4 + normalizedROI * 0.4 + normalizedStreak * 0.2;
      return { ...user, score };
    });

    normalizedData.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.roi - a.roi;
    });

    const rankedData: LeaderboardUser[] = normalizedData.map((user, index) => ({
      ...user,
      rank: index + 1,
      score: Math.round(user.score * 100) / 100,
    }));

    const userIds = rankedData.map((u) => u.id);
    const userBadgesRaw = await prisma.userBadge.findMany({
      where: { userId: { in: userIds } },
      select: {
        userId: true,
        badge: { select: { id: true, name: true, icon: true, rarity: true } },
      },
    });
    const badgesByUser = new Map<string, LeaderboardBadge[]>();
    for (const ub of userBadgesRaw) {
      const list = badgesByUser.get(ub.userId) ?? [];
      list.push({
        id: ub.badge.id,
        name: ub.badge.name,
        icon: ub.badge.icon,
        rarity: ub.badge.rarity ?? "COMMON",
      });
      badgesByUser.set(ub.userId, list);
    }
    const leaderboardWithBadges = rankedData.map((u) => ({
      ...u,
      badges: badgesByUser.get(u.id) ?? [],
    }));

    const currentUserId = session?.user?.id;
    const myEntry = currentUserId
      ? leaderboardWithBadges.find((u) => u.id === currentUserId)
      : null;
    const myRank = myEntry ? myEntry.rank : undefined;

    return NextResponse.json({
      leaderboard: leaderboardWithBadges,
      period,
      category,
      totalUsers: leaderboardWithBadges.length,
      myRank,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento della classifica" },
      { status: 500 }
    );
  }
}
