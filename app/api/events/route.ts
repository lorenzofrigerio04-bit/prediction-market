import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "open"; // open | closed | all
    const sort = searchParams.get("sort") || ""; // popular | expiring | recent | discussed
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const skip = (page - 1) * limit;
    const now = new Date();

    // Costruisci i filtri
    const where: any = {};

    // Filtro "in scadenza" vincola a eventi aperti che chiudono nei prossimi 7 giorni
    if (filter === "expiring") {
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      where.resolved = false;
      where.closesAt = { gte: now, lte: sevenDaysFromNow };
    } else {
      // Stato: aperti, chiusi, tutti
      if (status === "open") {
        where.resolved = false;
        where.closesAt = { gt: now };
      } else if (status === "closed") {
        where.OR = [{ resolved: true }, { closesAt: { lte: now } }];
      }
    }

    if (category) where.category = category;

    // Ricerca: AND con (title OR description)
    if (search.trim()) {
      const searchClause = {
        OR: [
          { title: { contains: search.trim(), mode: "insensitive" as const } },
          { description: { contains: search.trim(), mode: "insensitive" as const } },
        ],
      };
      where.AND = where.AND ? [...where.AND, searchClause] : [searchClause];
    }

    // Ordinamento: sort ha priorità su filter per compatibilità
    const orderKey = sort || (filter === "popular" ? "popular" : filter === "expiring" ? "expiring" : "recent");
    let orderBy: any = {};
    if (orderKey === "popular") {
      orderBy = { totalCredits: "desc" };
    } else if (orderKey === "expiring") {
      orderBy = { closesAt: "asc" };
    } else if (orderKey === "discussed") {
      orderBy = { comments: { _count: "desc" } };
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
