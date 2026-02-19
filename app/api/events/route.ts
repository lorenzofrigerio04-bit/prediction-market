import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEventsWithStats } from "@/lib/fomo/event-stats";

export const dynamic = "force-dynamic";

const LANDING_DIVERSE_COUNT = 4;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "open";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "recent";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const forLanding = searchParams.get("forLanding") === "1";
    const deadline = searchParams.get("deadline") || "";
    const search = searchParams.get("search") || "";
    const now = new Date();

    const where: Record<string, unknown> = {};
    // Mostriamo tutti gli eventi (inclusi quelli del generatore) così la pagina Eventi e Discover restano piene
    where.category = { not: "News" };

    if (status === "open") {
      where.resolved = false;
      where.closesAt = { gt: now };
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

    if (category) where.category = category;

    if (search.trim()) {
      where.AND = [
        ...((where.AND as object[]) || []),
        {
          OR: [
            { title: { contains: search.trim(), mode: "insensitive" as const } },
            { description: { contains: search.trim(), mode: "insensitive" as const } },
          ],
        },
      ];
    }

    const orderBy =
      sort === "popular"
        ? { totalCredits: "desc" as const }
        : sort === "expiring"
          ? { closesAt: "asc" as const }
          : sort === "discussed"
            ? { comments: { _count: "desc" as const } }
            : { createdAt: "desc" as const };

    if (forLanding) {
      const events = await prisma.event.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          createdBy: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { Prediction: true, comments: true },
          },
        },
      });

      const seen = new Set<string>();
      const diverse: typeof events = [];
      for (const e of events) {
        if (seen.has(e.category)) continue;
        seen.add(e.category);
        diverse.push(e);
        if (diverse.length >= LANDING_DIVERSE_COUNT) break;
      }

      const eventIds = diverse.map((e) => e.id);
      const fomoStats = await getEventsWithStats(prisma, eventIds, now);

      const eventsWithStats = diverse.map((event) => {
        const stats = fomoStats.get(event.id);
        const { _count, ...rest } = event;
        return {
          ...rest,
          _count: { predictions: _count.Prediction, comments: _count.comments },
          fomo: stats || {
            countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
            participantsCount: _count.Prediction,
            votesVelocity: 0,
            pointsMultiplier: 1.0,
            isClosingSoon: false,
          },
        };
      });

      return NextResponse.json({
        events: eventsWithStats,
        pagination: {
          page: 1,
          limit: eventsWithStats.length,
          total: eventsWithStats.length,
          totalPages: 1,
        },
      });
    }

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          createdBy: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { Prediction: true, comments: true },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    const eventIds = events.map((e) => e.id);
    const fomoStats = await getEventsWithStats(prisma, eventIds, now);

    const eventsWithStats = events.map((event) => {
      const stats = fomoStats.get(event.id);
      const { _count, ...rest } = event;
      return {
        ...rest,
        _count: { predictions: _count.Prediction, comments: _count.comments },
        fomo: stats || {
          countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
          participantsCount: _count.Prediction,
          votesVelocity: 0,
          pointsMultiplier: 1.0,
          isClosingSoon: false,
        },
      };
    });

    return NextResponse.json({
      events: eventsWithStats,
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
