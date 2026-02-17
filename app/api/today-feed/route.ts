import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/today-feed
 * Dati aggregati per il feed "Oggi": eventi in scadenza, in tendenza, streak e progresso reward.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const now = new Date();
    const inSixHours = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [closingSoonEvents, trendingEvents] = await Promise.all([
      prisma.event.findMany({
        where: {
          resolved: false,
          closesAt: { gte: now, lte: inSixHours },
        },
        orderBy: { closesAt: "asc" },
        take: 3,
        select: {
          id: true,
          title: true,
          category: true,
          closesAt: true,
          resolutionSourceUrl: true,
        },
      }),
      prisma.event.findMany({
        where: {
          resolved: false,
          closesAt: { gt: now },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          closesAt: true,
        },
      }),
    ]);

    const trendingWithVolume = await Promise.all(
      trendingEvents.map(async (e) => {
        const agg = await prisma.prediction.aggregate({
          where: {
            eventId: e.id,
            createdAt: { gte: oneDayAgo },
          },
          _sum: { amount: true },
          _count: true,
        });
        return {
          ...e,
          volume: agg._sum.amount ?? 0,
        };
      })
    );

    trendingWithVolume.sort((a, b) => b.volume - a.volume);
    const trendingNow = trendingWithVolume.slice(0, 3).map(({ volume: _v, ...e }) => e);

    let streakStatus = { streakCount: 0, hasPredictedToday: false };
    let rewardProgress = {
      remainingPredictions: 0,
      rewardCredits: 0,
      currentProgress: 0,
      targetProgress: 3,
    };

    if (session?.user?.id) {
      const userId = session.user.id;
      const startOfToday = new Date(now);
      startOfToday.setUTCHours(0, 0, 0, 0);
      const [user, predictionsToday, dailyMission] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { streakCount: true },
        }),
        prisma.prediction.count({
          where: {
            userId,
            createdAt: { gte: startOfToday },
          },
        }),
        prisma.mission.findFirst({
          where: { active: true, period: "DAILY" },
          select: { target: true, reward: true },
        }),
      ]);

      streakStatus = {
        streakCount: user?.streakCount ?? 0,
        hasPredictedToday: predictionsToday > 0,
      };

      const target = dailyMission?.target ?? 3;
      const reward = dailyMission?.reward ?? 0;
      rewardProgress = {
        remainingPredictions: Math.max(0, target - predictionsToday),
        rewardCredits: reward,
        currentProgress: predictionsToday,
        targetProgress: target,
      };
    }

    return NextResponse.json({
      closingSoon: {
        events: closingSoonEvents,
        totalCount: closingSoonEvents.length,
      },
      trendingNow: {
        events: trendingNow,
      },
      streakStatus,
      rewardProgress,
    });
  } catch (error) {
    console.error("Error fetching today feed:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento del feed" },
      { status: 500 }
    );
  }
}
