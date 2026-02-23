import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { getEventProbability } from "@/lib/pricing/price-display";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/closing-soon
 * Eventi in scadenza (open, closesAt ASC).
 */
export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "10", 10) || 10, 50);
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        resolved: false,
        closesAt: { gt: now },
        category: { not: "News" },
      },
      orderBy: { closesAt: "asc" },
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        _count: { select: { Prediction: true, comments: true } },
        ammState: { select: { qYesMicros: true, qNoMicros: true, bMicros: true } },
      },
    });

    const eventsWithCount = events.map((e) => {
      const { ammState, ...rest } = e;
      const probability =
        e.tradingMode === "AMM" && ammState
          ? Number((priceYesMicros(ammState.qYesMicros, ammState.qNoMicros, ammState.bMicros) * 100n) / SCALE)
          : getEventProbability(e);
      return {
        ...rest,
        probability,
        _count: { predictions: e._count.Prediction, comments: e._count.comments },
      };
    });

    return NextResponse.json({ events: eventsWithCount });
  } catch (error) {
    console.error("closing-soon error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento" },
      { status: 500 }
    );
  }
}
