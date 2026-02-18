import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { validateMarket } from "@/lib/validator";
import { getBParameter } from "@/lib/pricing/initialization";
import { getBufferHoursForCategory } from "@/lib/markets";
import { parseOutcomeDateFromText } from "@/lib/event-generation/closes-at";
import { getClosureRules } from "@/lib/event-generation/config";
import { computeDedupKey } from "@/lib/event-publishing/dedup";

/**
 * GET /api/admin/events
 * Ottiene tutti gli eventi (per admin dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all"; // all, pending, pending_resolution, resolved
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Record<string, unknown> = {};
    if (status === "pending") {
      where.resolved = false;
    } else if (status === "pending_resolution") {
      where.resolved = false;
      where.closesAt = { lte: now };
    } else if (status === "resolved") {
      where.resolved = true;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy:
          status === "pending_resolution"
            ? { closesAt: "asc" }
            : { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              Prediction: true,
              comments: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin events:", error);
    if (error.message === "Non autenticato" || error.message.includes("Accesso negato")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Errore nel caricamento degli eventi" },
      { status: 500 }
    );
  }
}

/** Tolleranza (ms) per considerare closesAt coerente con la data esito (48h). */
const COHERENCE_TOLERANCE_MS = 48 * 60 * 60 * 1000;

/**
 * POST /api/admin/events
 * Crea un nuovo evento.
 * Coerenza scadenza–esito: si può passare eventOutcomeDate (data in cui si saprà l'esito);
 * il sistema calcola closesAt = eventOutcomeDate - ore prima. In alternativa si passa closesAt,
 * ma se titolo/descrizione contengono una data esito, viene verificata la coerenza.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

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

    if (!title || !category) {
      return NextResponse.json(
        { error: "Titolo e categoria sono obbligatori" },
        { status: 400 }
      );
    }

    if (!resolutionSourceUrl || typeof resolutionSourceUrl !== "string" || !resolutionSourceUrl.trim()) {
      return NextResponse.json(
        { error: "URL fonte di risoluzione è obbligatorio" },
        { status: 400 }
      );
    }

    if (!resolutionNotes || typeof resolutionNotes !== "string" || !resolutionNotes.trim()) {
      return NextResponse.json(
        { error: "Note di risoluzione sono obbligatorie" },
        { status: 400 }
      );
    }

    const now = new Date();
    const rules = getClosureRules();
    let closesAtDate: Date;

    if (eventOutcomeDate != null && String(eventOutcomeDate).trim() !== "") {
      const outcomeDate = new Date(eventOutcomeDate);
      if (Number.isNaN(outcomeDate.getTime())) {
        return NextResponse.json(
          { error: "Data esito evento (eventOutcomeDate) non valida" },
          { status: 400 }
        );
      }
      if (outcomeDate.getTime() <= now.getTime()) {
        return NextResponse.json(
          { error: "La data esito evento deve essere nel futuro" },
          { status: 400 }
        );
      }
      closesAtDate = new Date(
        outcomeDate.getTime() - rules.hoursBeforeEvent * 60 * 60 * 1000
      );
      const minClose = new Date(
        now.getTime() + rules.minHoursFromNow * 60 * 60 * 1000
      );
      if (closesAtDate.getTime() < minClose.getTime()) {
        closesAtDate = minClose;
      }
    } else if (closesAtBody != null && String(closesAtBody).trim() !== "") {
      closesAtDate = new Date(closesAtBody);
      if (Number.isNaN(closesAtDate.getTime())) {
        return NextResponse.json(
          { error: "Data di chiusura non valida" },
          { status: 400 }
        );
      }
      if (closesAtDate.getTime() <= now.getTime()) {
        return NextResponse.json(
          { error: "La data di chiusura deve essere nel futuro" },
          { status: 400 }
        );
      }
      const text = [title, description ?? ""].filter(Boolean).join(" ");
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
                "La data di chiusura non è coerente con la data esito dell'evento (ricavata da titolo/descrizione). " +
                "Usa il campo eventOutcomeDate con la data in cui si saprà l'esito, oppure imposta una data di chiusura vicina a: " +
                expectedClosesAt.toISOString().slice(0, 16),
              suggestedClosesAt: expectedClosesAt.toISOString(),
            },
            { status: 400 }
          );
        }
      }
    } else {
      return NextResponse.json(
        { error: "Fornire data di chiusura (closesAt) oppure data esito evento (eventOutcomeDate)" },
        { status: 400 }
      );
    }

    const marketValidation = validateMarket({
      title,
      description: description ?? null,
      closesAt: closesAtDate.toISOString(),
      resolutionSourceUrl: resolutionSourceUrl.trim(),
      resolutionNotes: resolutionNotes.trim(),
    });
    if (!marketValidation.valid) {
      return NextResponse.json(
        { error: "Validazione mercato fallita", reasons: marketValidation.reasons },
        { status: 400 }
      );
    }

    const b = getBParameter(category as Parameters<typeof getBParameter>[0], "Medium");
    const resolutionBufferHours = getBufferHoursForCategory(category);

    let resolutionAuthorityHost: string | null = null;
    try {
      resolutionAuthorityHost = new URL(resolutionSourceUrl.trim()).host;
    } catch {
      // URL non valido: host non impostato
    }

    let dedupKey: string;
    if (resolutionAuthorityHost && resolutionAuthorityHost.trim() !== "") {
      dedupKey = computeDedupKey({
        title,
        closesAt: closesAtDate,
        resolutionAuthorityHost,
      });
    } else {
      dedupKey = createHash("sha256")
        .update(`${title}|${closesAtDate.toISOString()}|${admin.id}|${randomUUID()}`)
        .digest("hex");
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        category,
        closesAt: closesAtDate,
        resolutionSourceUrl: resolutionSourceUrl.trim(),
        resolutionNotes: resolutionNotes.trim(),
        createdById: admin.id,
        resolutionStatus: marketValidation.needsReview ? "NEEDS_REVIEW" : "PENDING",
        b,
        resolutionBufferHours,
        dedupKey,
        ...(resolutionAuthorityHost && { resolutionAuthorityHost }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await createAuditLog(prisma, {
      userId: admin.id,
      action: "EVENT_CREATE",
      entityType: "event",
      entityId: event.id,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    if (error.message === "Non autenticato" || error.message.includes("Accesso negato")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Errore nella creazione dell'evento" },
      { status: 500 }
    );
  }
}
