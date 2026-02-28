import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/trending-now
 * Eventi aperti ordinati per totalCredits (popolarità).
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
      orderBy: { totalCredits: "desc" },
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        _count: { select: { Prediction: true, Trade: true, comments: true } },
      },
    });

    const predCount = (c: { Prediction: number; Trade: number }) => (c.Prediction ?? 0) + (c.Trade ?? 0);
    const eventsWithCount = events.map((e) => {
      const count = predCount(e._count as { Prediction: number; Trade: number });
      return {
        ...e,
        _count: { predictions: count, comments: e._count.comments },
      };
    });

    return NextResponse.json({ events: eventsWithCount });
  } catch (error) {
    console.error("trending-now error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento" },
      { status: 500 }
    );
  }
}
