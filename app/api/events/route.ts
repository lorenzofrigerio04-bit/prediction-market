import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheGetJson, cacheSetJson } from "@/lib/cache/redis";
import { DEBUG_TITLE_PREFIX } from "@/lib/debug-display";
import { getEventsWithStats } from "@/lib/fomo/event-stats";

const TRENDING_CACHE_TTL_SEC = 10 * 60; // 10 minutes
const TRENDING_KEY_PREFIX = "trending:";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "open"; // open | closed | all
    const deadline = searchParams.get("deadline") || ""; // all | 24h | 7d (solo per status=open)
    const sort = searchParams.get("sort") || ""; // popular | expiring | recent | discussed
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const orderKey = sort || (filter === "popular" ? "popular" : filter === "expiring" ? "expiring" : "recent");
    const isTrendingRequest = orderKey === "popular" && !search.trim() && status === "open" && !deadline && page === 1 && limit === 12;
    const trendingCacheKey = isTrendingRequest ? TRENDING_KEY_PREFIX + (category || "all") : null;

    if (trendingCacheKey) {
      const cached = await cacheGetJson<{ events: unknown[]; pagination: unknown }>(trendingCacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const skip = (page - 1) * limit;
    const now = new Date();

    // Costruisci i filtri
    const where: any = {};

    if (filter === "expiring") {
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      where.resolved = false;
      where.closesAt = { gte: now, lte: sevenDaysFromNow };
    } else {
      if (status === "open") {
        where.resolved = false;
        where.closesAt = { gt: now };
        // Filtro scadenza: chiude entro 24h o 7 giorni
        if (deadline === "24h") {
          const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          where.closesAt = { gte: now, lte: in24h };
        } else if (deadline === "7d") {
          const in7d = new Date(now);
          in7d.setDate(in7d.getDate() + 7);
          where.closesAt = { gte: now, lte: in7d };
        }
      } else if (status === "closed") {
        where.OR = [{ resolved: true }, { closesAt: { lte: now } }];
      }
    }

    if (category) where.category = category;

    // Hide debug-only markets from normal feed (no [DEBUG] titles unless in debug mode elsewhere).

    // Ricerca: AND con (title OR description)
    if (search.trim()) {
      const searchClause = {
        OR: [
          { description: { contains: search.trim(), mode: "insensitive" as const } },
        ],
      };
      where.AND = where.AND ? [...where.AND, searchClause] : [searchClause];
    }

    // Ordinamento
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
            Prediction: true,
            comments: true,
          },
        },
      },
    });

    // Calcola statistiche FOMO per tutti gli eventi
    const eventIds = events.map((e) => e.id);
    const fomoStats = await getEventsWithStats(prisma, eventIds, now);

    // Aggiungi statistiche FOMO agli eventi
    const eventsWithStats = events.map((event) => {
      const stats = fomoStats.get(event.id);
      return {
        ...event,
        fomo: stats || {
          countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
          participantsCount: event._count.Prediction,
          votesVelocity: 0,
          pointsMultiplier: 1.0,
          isClosingSoon: false,
        },
      };
    });

    const payload = {
      events: eventsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    if (trendingCacheKey) {
      cacheSetJson(trendingCacheKey, payload, TRENDING_CACHE_TTL_SEC).catch(() => {});
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
