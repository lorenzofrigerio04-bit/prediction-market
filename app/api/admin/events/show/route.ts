import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/events/show
 * Rende di nuovo visibili gli eventi con id in body.eventIds.
 * Eventi sport (footballDataMatchId non null o templateId sport-football-fixture) → sourceType='SPORT' (riappaiono in /sport).
 * Altri eventi → sourceType='NEWS' (Home/Esplora).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdminCapability("events:create");

    const body = await request.json().catch(() => ({}));
    const eventIds = Array.isArray(body.eventIds) ? body.eventIds : [];
    const ids = eventIds.filter((id: unknown) => typeof id === "string" && id.length > 0);

    if (ids.length === 0) {
      return NextResponse.json({ error: "Nessun evento da rendere visibile", updated: 0 }, { status: 400 });
    }

    const events = await prisma.event.findMany({
      where: { id: { in: ids } },
      select: { id: true, footballDataMatchId: true, templateId: true },
    });

    const sportIds = events
      .filter((e) => e.footballDataMatchId != null || e.templateId === "sport-football-fixture")
      .map((e) => e.id);
    const newsIds = ids.filter((id: string) => !sportIds.includes(id));

    let updated = 0;
    if (sportIds.length > 0) {
      const r = await prisma.event.updateMany({
        where: { id: { in: sportIds } },
        data: { sourceType: "SPORT" },
      });
      updated += r.count;
    }
    if (newsIds.length > 0) {
      const r = await prisma.event.updateMany({
        where: { id: { in: newsIds } },
        data: { sourceType: "NEWS" },
      });
      updated += r.count;
    }

    return NextResponse.json({ success: true, updated });
  } catch (error: unknown) {
    if (error instanceof Error && (error.message === "Non autenticato" || error.message.includes("Accesso negato"))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error showing events:", error);
    return NextResponse.json(
      { error: "Errore durante la modifica" },
      { status: 500 }
    );
  }
}
