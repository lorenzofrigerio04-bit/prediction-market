import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const skip = (page - 1) * limit;

    // Costruisci i filtri
    const where: any = {
      resolved: false, // Mostra solo eventi non risolti di default
    };

    // Filtro per categoria
    if (category) {
      where.category = category;
    }

    // Filtro per ricerca
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filtro per "in scadenza" (chiude nei prossimi 7 giorni)
    if (filter === "expiring") {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      where.closesAt = {
        lte: sevenDaysFromNow,
        gte: new Date(),
      };
    }

    // Ordina per popolarità o data
    let orderBy: any = {};
    if (filter === "popular") {
      orderBy = { totalCredits: "desc" };
    } else {
      orderBy = { createdAt: "desc" };
    }

    // Conta il totale
    const total = await prisma.event.count({ where });

    // Recupera gli eventi
    const events = await prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            predictions: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
