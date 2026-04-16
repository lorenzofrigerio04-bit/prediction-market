import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    // Fetch events that have no feedback entries yet
    const events = await prisma.event.findMany({
      where: {
        feedbacks: { none: {} },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        closesAt: true,
        createdAt: true,
        resolved: true,
        marketType: true,
        sourceType: true,
        _count: {
          select: {
            feedbacks: true,
            Prediction: true,
          },
        },
      },
    });

    // Total events count for progress tracking
    const totalEvents = await prisma.event.count();
    const reviewedCount = await prisma.event.count({
      where: { feedbacks: { some: {} } },
    });

    return NextResponse.json({
      events,
      stats: {
        total: totalEvents,
        reviewed: reviewedCount,
        pending: totalEvents - reviewedCount,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Errore";
    if (msg === "Non autenticato" || msg.includes("Accesso negato")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    console.error("[pending-review GET]", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
