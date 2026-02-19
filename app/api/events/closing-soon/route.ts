import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        NOT: { createdBy: { email: "event-generator@system" } },
      },
      orderBy: { closesAt: "asc" },
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        _count: { select: { Prediction: true, comments: true } },
      },
    });

    const eventsWithCount = events.map((e) => ({
      ...e,
      _count: { predictions: e._count.Prediction, comments: e._count.comments },
    }));

    return NextResponse.json({ events: eventsWithCount });
  } catch (error) {
    console.error("closing-soon error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento" },
      { status: 500 }
    );
  }
}
