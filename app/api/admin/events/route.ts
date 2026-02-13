import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/events
 * Ottiene tutti gli eventi (per admin dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all"; // all, pending, resolved
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status === "pending") {
      where.resolved = false;
    } else if (status === "resolved") {
      where.resolved = true;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
              predictions: true,
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

/**
 * POST /api/admin/events
 * Crea un nuovo evento
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const { title, description, category, closesAt } = body;

    // Validazione
    if (!title || !category || !closesAt) {
      return NextResponse.json(
        { error: "Titolo, categoria e data di chiusura sono obbligatori" },
        { status: 400 }
      );
    }

    const closesAtDate = new Date(closesAt);
    if (isNaN(closesAtDate.getTime())) {
      return NextResponse.json(
        { error: "Data di chiusura non valida" },
        { status: 400 }
      );
    }

    if (closesAtDate <= new Date()) {
      return NextResponse.json(
        { error: "La data di chiusura deve essere nel futuro" },
        { status: 400 }
      );
    }

    // Crea l'evento
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        category,
        closesAt: closesAtDate,
        createdById: admin.id,
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
