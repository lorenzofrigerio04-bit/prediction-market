import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const DISPUTE_WINDOW_HOURS = 2;

/**
 * GET /api/admin/disputes
 * Eventi nella finestra dispute (es. risolti nelle ultime 2 ore)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const since = new Date();
    since.setHours(since.getHours() - DISPUTE_WINDOW_HOURS);

    const events = await prisma.event.findMany({
      where: {
        resolved: true,
        resolvedAt: { gte: since },
      },
      orderBy: { resolvedAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { Prediction: true, Trade: true } },
      },
    });

    const eventsForClient = events.map((e) => {
      const { _count, ...rest } = e;
      const predictions = (_count.Prediction ?? 0) + ((_count as { Trade?: number }).Trade ?? 0);
      return { ...rest, _count: { predictions } };
    });
    return NextResponse.json({ events: eventsForClient });
  } catch (error: any) {
    if (error.message === "Non autenticato" || error.message?.includes("Accesso negato")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
