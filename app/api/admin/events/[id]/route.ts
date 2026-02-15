import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { parseOutcomeDateFromText } from "@/lib/event-generation/closes-at";
import { getClosureRules } from "@/lib/event-generation/config";

const COHERENCE_TOLERANCE_MS = 48 * 60 * 60 * 1000;

/**
 * GET /api/admin/events/[id]
 * Dettaglio evento (per modifica admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error: any) {
    if (error.message === "Non autenticato" || error.message?.includes("Accesso negato")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/events/[id]
 * Modifica evento (solo campi editabili, con AuditLog)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const eventId = params.id;
    const body = await request.json();
    const {
      title,
      description,
      category,
      closesAt: closesAtBody,
      eventOutcomeDate,
      resolutionSourceUrl,
      resolutionNotes,
    } = body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }
    if (event.resolved) {
      return NextResponse.json(
        { error: "Non si può modificare un evento già risolto" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (category !== undefined) data.category = category;
    if (resolutionSourceUrl !== undefined) data.resolutionSourceUrl = resolutionSourceUrl?.trim() || null;
    if (resolutionNotes !== undefined) data.resolutionNotes = resolutionNotes?.trim() || null;

    const now = new Date();
    const rules = getClosureRules();
    if (eventOutcomeDate != null && String(eventOutcomeDate).trim() !== "") {
      const outcomeDate = new Date(eventOutcomeDate);
      if (!Number.isNaN(outcomeDate.getTime()) && outcomeDate.getTime() > now.getTime()) {
        let closesAtDate = new Date(
          outcomeDate.getTime() - rules.hoursBeforeEvent * 60 * 60 * 1000
        );
        const minClose = new Date(
          now.getTime() + rules.minHoursFromNow * 60 * 60 * 1000
        );
        if (closesAtDate.getTime() < minClose.getTime()) closesAtDate = minClose;
        data.closesAt = closesAtDate;
      }
    } else if (closesAtBody !== undefined) {
      const closesAtDate = new Date(closesAtBody);
      if (Number.isNaN(closesAtDate.getTime()) || closesAtDate.getTime() <= now.getTime()) {
        return NextResponse.json(
          { error: "La data di chiusura deve essere nel futuro" },
          { status: 400 }
        );
      }
      const text = [
        (title !== undefined ? title : event.title) as string,
        (description !== undefined ? description : event.description) ?? "",
      ]
        .filter(Boolean)
        .join(" ");
      const parsedOutcome = parseOutcomeDateFromText(text);
      if (parsedOutcome && parsedOutcome.getTime() > now.getTime()) {
        const expectedClosesAt = new Date(
          parsedOutcome.getTime() - rules.hoursBeforeEvent * 60 * 60 * 1000
        );
        const diff = Math.abs(closesAtDate.getTime() - expectedClosesAt.getTime());
        if (diff > COHERENCE_TOLERANCE_MS) {
          return NextResponse.json(
            {
              error:
                "La data di chiusura non è coerente con la data esito dell'evento. Suggerita: " +
                expectedClosesAt.toISOString().slice(0, 16),
              suggestedClosesAt: expectedClosesAt.toISOString(),
            },
            { status: 400 }
          );
        }
      }
      data.closesAt = closesAtDate;
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data,
    });

    await createAuditLog(prisma, {
      userId: admin.id,
      action: "EVENT_UPDATE",
      entityType: "event",
      entityId: eventId,
      payload: { fields: Object.keys(data) },
    });

    return NextResponse.json({ event: updated });
  } catch (error: any) {
    if (error.message === "Non autenticato" || error.message?.includes("Accesso negato")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore nell'aggiornamento" }, { status: 500 });
  }
}
