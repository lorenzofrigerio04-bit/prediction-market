import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/events/hide
 * Imposta sourceType='HIDDEN' per gli eventi con id in body.eventIds.
 * Toglie gli eventi dalla visualizzazione su Home/Esplora/feed (non li elimina dal DB).
 * Non usa il campo hidden (compatibile anche senza quella colonna).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminCapability("events:create");

    const body = await request.json().catch(() => ({}));
    const eventIds = Array.isArray(body.eventIds) ? body.eventIds : [];
    const ids = eventIds.filter((id: unknown) => typeof id === "string" && id.length > 0);

    if (ids.length === 0) {
      return NextResponse.json({ error: "Nessun evento da nascondere", updated: 0 }, { status: 400 });
    }

    const result = await prisma.event.updateMany({
      where: { id: { in: ids } },
      data: { sourceType: "HIDDEN" },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error: unknown) {
    if (error instanceof Error && (error.message === "Non autenticato" || error.message.includes("Accesso negato"))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error hiding events:", error);
    return NextResponse.json(
      { error: "Errore durante la modifica" },
      { status: 500 }
    );
  }
}
