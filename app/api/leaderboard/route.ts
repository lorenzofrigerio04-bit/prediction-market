import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type PeriodType = "weekly" | "monthly" | "all-time";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  accuracy: number;
  roi: number;
  streak: number;
  score: number;
  totalPredictions: number;
  correctPredictions: number;
  totalEarned: number;
  totalSpent: number;
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

    if (period === "weekly") {
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
        totalPredictions: {
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        accuracy: true,
        streak: true,
        totalPredictions: true,
        correctPredictions: true,
        totalEarned: true,
        totalSpent: true,
      },
    });

    // Calculate ROI and filter predictions by period if needed
    const leaderboardData: LeaderboardUser[] = await Promise.all(
      users.map(async (user) => {
        let periodStats = {
          totalPredictions: user.totalPredictions,
          correctPredictions: user.correctPredictions,
          totalEarned: user.totalEarned,
          totalSpent: user.totalSpent,
        };

        // If period is not all-time or category filter, recalculate stats with filters
        const needFilter = startDate || category;
        if (needFilter) {
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
        }

        // Calculate accuracy for the period
        const periodAccuracy =
          periodStats.totalPredictions > 0
            ? (periodStats.correctPredictions / periodStats.totalPredictions) * 100
            : 0;

        // Calculate ROI for the period
        const roi =
          periodStats.totalSpent > 0
            ? ((periodStats.totalEarned - periodStats.totalSpent) /
                periodStats.totalSpent) *
              100
            : 0;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          accuracy: Math.round(periodAccuracy * 100) / 100,
          roi: Math.round(roi * 100) / 100,
          streak: user.streak,
          score: 0, // filled below
          totalPredictions: periodStats.totalPredictions,
          correctPredictions: periodStats.correctPredictions,
          totalEarned: periodStats.totalEarned,
          totalSpent: periodStats.totalSpent,
        } as LeaderboardUser;
      })
    );

    // Filter out users with no predictions in the period
    const filteredData = leaderboardData.filter(
      (user) => user.totalPredictions > 0
    );

    // Sort by performance score (weighted combination of accuracy, ROI, and streak)
    // Score = (accuracy * 0.4) + (ROI * 0.4) + (streak * 0.2)
    // Normalize ROI to 0-100 scale (assuming ROI ranges from -100 to +500)
    const normalizedData = filteredData.map((user) => {
      const normalizedROI = Math.max(0, Math.min(100, (user.roi + 100) / 6)); // Map -100 to 500 ROI to 0-100
      const normalizedStreak = Math.min(100, user.streak * 5); // Max streak weight is 100 (20 days = 100)
      const score =
        user.accuracy * 0.4 + normalizedROI * 0.4 + normalizedStreak * 0.2;
      return { ...user, score };
    });

    // Sort by score descending, then by accuracy, then by ROI
    normalizedData.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.roi - a.roi;
    });

    // Add rank and round score
    const rankedData: LeaderboardUser[] = normalizedData.map((user, index) => ({
      ...user,
      rank: index + 1,
      score: Math.round(user.score * 100) / 100,
    }));

    const currentUserId = session?.user?.id;
    const myEntry = currentUserId
      ? rankedData.find((u) => u.id === currentUserId)
      : null;
    const myRank = myEntry ? myEntry.rank : undefined;

    return NextResponse.json({
      leaderboard: rankedData,
      period,
      category,
      totalUsers: rankedData.length,
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
