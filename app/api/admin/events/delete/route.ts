import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/events/delete
 * Elimina definitivamente gli eventi con id in body.eventIds dalla piattaforma e dal database.
 * Le relazioni (Position, Trade, Comment, Post, ecc.) sono eliminate in cascade dallo schema Prisma.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminCapability("events:create");

    const body = await request.json().catch(() => ({}));
    const eventIds = Array.isArray(body.eventIds) ? body.eventIds : [];
    const ids = eventIds.filter((id: unknown) => typeof id === "string" && id.length > 0);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Nessun evento da eliminare", deleted: 0 },
        { status: 400 }
      );
    }

    // deleteMany su Event: il DB elimina in cascade le righe collegate (Position, Trade, Comment, Post, ecc.)
    const result = await prisma.event.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error deleting events:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione" },
      { status: 500 }
    );
  }
}
