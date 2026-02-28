import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { getEventProbability } from "@/lib/pricing/price-display";

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
    const now = new Date();

    const follows = await prisma.eventFollower.findMany({
      where: { userId },
      select: { eventId: true },
    });
    const eventIds = follows.map((f) => f.eventId);
    if (eventIds.length === 0) {
      return NextResponse.json({
        events: [],
        categories: [],
        topFollowed: [],
        totalEvents: 0,
        totalCategories: 0,
      });
    }

    const events = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
        status: "OPEN",
        resolved: false,
        closesAt: { gt: now },
      },
      include: {
        ammState: {
          select: { qYesMicros: true, qNoMicros: true, bMicros: true },
        },
        _count: {
          select: { Prediction: true, Trade: true, followers: true },
        },
      },
    });

    const predCount = (c: { Prediction?: number; Trade?: number }) => (c?.Prediction ?? 0) + (c?.Trade ?? 0);
    const result = events.map((e) => {
      let probability: number;
      if (e.tradingMode === "AMM" && e.ammState) {
        const yesMicros = priceYesMicros(
          e.ammState.qYesMicros,
          e.ammState.qNoMicros,
          e.ammState.bMicros
        );
        probability = Number((yesMicros * 100n) / SCALE);
      } else {
        probability = getEventProbability(e);
      }
      return {
        id: e.id,
        title: e.title,
        category: e.category,
        closesAt: e.closesAt.toISOString(),
        probability,
        yesPct: Math.round(probability),
        predictionsCount: predCount(e._count as { Prediction?: number; Trade?: number }),
        followersCount: e._count?.followers ?? 0,
      };
    });

    const categories = [...new Set(result.map((e) => e.category))].sort();
    const sortedByFollowers = [...result].sort(
      (a, b) => b.followersCount - a.followersCount
    );
    const topFollowed = sortedByFollowers.slice(0, 10);

    return NextResponse.json({
      events: result,
      categories,
      topFollowed,
      totalEvents: result.length,
      totalCategories: categories.length,
    });
  } catch (error) {
    console.error("Error fetching followed events:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento degli eventi seguiti" },
      { status: 500 }
    );
  }
}
