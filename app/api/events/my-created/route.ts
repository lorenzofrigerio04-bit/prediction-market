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

    const events = await prisma.event.findMany({
      where: {
        createdById: userId,
        status: "OPEN",
        resolved: false,
        closesAt: { gt: now },
      },
      include: {
        ammState: {
          select: { qYesMicros: true, qNoMicros: true, bMicros: true },
        },
        _count: {
          select: { Prediction: true },
        },
      },
    });

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
        predictionsCount: e._count?.Prediction ?? 0,
      };
    });

    const categories = [...new Set(result.map((e) => e.category))].sort();
    result.sort((a, b) => b.predictionsCount - a.predictionsCount);
    const topCreated = result.slice(0, 3);

    return NextResponse.json({
      events: result,
      categories,
      topCreated,
      totalEvents: result.length,
      totalCategories: categories.length,
    });
  } catch (error) {
    console.error("Error fetching my-created events:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento degli eventi creati" },
      { status: 500 }
    );
  }
}
