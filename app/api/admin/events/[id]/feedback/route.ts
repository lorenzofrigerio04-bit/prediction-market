import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

const VALID_RATINGS = new Set(["POSITIVE", "NEGATIVE"]);
const VALID_CATEGORIES = new Set([
  "OVERALL",
  "TITLE",
  "DESCRIPTION",
  "MARKET_TYPE",
  "RESOLUTION_CRITERIA",
  "CREATIVITY",
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    void admin;
    const { id: eventId } = await params;

    const feedbacks = await prisma.eventFeedback.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ feedbacks });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Errore";
    if (msg === "Non autenticato" || msg.includes("Accesso negato")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: eventId } = await params;

    const body = await request.json();
    const { rating, reason, category } = body as {
      rating?: string;
      reason?: string;
      category?: string;
    };

    if (!rating || !VALID_RATINGS.has(rating)) {
      return NextResponse.json(
        { error: "rating deve essere POSITIVE o NEGATIVE" },
        { status: 400 }
      );
    }
    if (!category || !VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: `category deve essere uno tra: ${[...VALID_CATEGORIES].join(", ")}` },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }

    const feedback = await prisma.eventFeedback.create({
      data: {
        eventId,
        userId: admin.id,
        rating,
        reason: reason?.trim() || null,
        category,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    await createAuditLog(prisma, {
      userId: admin.id,
      action: "EVENT_FEEDBACK_SUBMITTED",
      entityType: "Event",
      entityId: eventId,
      payload: { rating, category, reason: reason?.trim() || null },
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Errore";
    if (msg === "Non autenticato" || msg.includes("Accesso negato")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    console.error("[EventFeedback POST]", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
