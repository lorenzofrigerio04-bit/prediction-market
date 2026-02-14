import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/comments
 * Lista commenti per moderazione (con paginazione e filtro eventId)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const eventId = searchParams.get("eventId") || undefined;
    const hiddenFilter = searchParams.get("hidden"); // "true" | "false" | omit = tutti

    const where: { eventId?: string; hidden?: boolean } = {};
    if (eventId) where.eventId = eventId;
    if (hiddenFilter === "true") where.hidden = true;
    if (hiddenFilter === "false") where.hidden = false;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true } },
          _count: { select: { reactions: true, replies: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Non autenticato" || error.message?.includes("Accesso negato")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
