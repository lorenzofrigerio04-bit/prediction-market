import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEventsWithStats } from "@/lib/fomo/event-stats";

export const dynamic = "force-dynamic";

const CONSIGLIATI_LIMIT = 30;
const COLD_START_PREDICTIONS_THRESHOLD = 5;
const COLD_START_PER_CATEGORY = 3;
const WARM_MAIN_CATEGORIES = 4;
const WARM_DISCOVERY_COUNT = 3;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * GET /api/events/consigliati
 * Feed "Consigliati" per il vertical scroll: funziona con o senza auth.
 * - Senza auth: eventi virali per categoria, shuffle, fino a limit.
 * - Con auth: stessa logica di for-you (cold/warm), più isFollowing per ogni evento.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(CONSIGLIATI_LIMIT), 10) || CONSIGLIATI_LIMIT,
      50
    );
    const now = new Date();

    const baseWhere = {
      resolved: false,
      status: "OPEN" as const,
      closesAt: { gt: now },
      category: { not: "News" as const },
    };

    let eventIds: string[];

    if (!session?.user?.id) {
      const categories = await prisma.event
        .findMany({
          where: baseWhere,
          select: { category: true },
          distinct: ["category"],
        })
        .then((rows) => rows.map((r) => r.category).filter(Boolean));

      if (categories.length === 0) {
        const fallback = await prisma.event.findMany({
          where: baseWhere,
          orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
          take: limit,
          select: { id: true },
        });
        eventIds = fallback.map((e) => e.id);
      } else {
        const viralPerCategory: string[] = [];
        for (const category of categories) {
          const events = await prisma.event.findMany({
            where: { ...baseWhere, category },
            orderBy: [
              { yesPredictions: "desc" },
              { totalCredits: "desc" },
              { createdAt: "desc" },
            ],
            take: COLD_START_PER_CATEGORY + 2,
            select: { id: true },
          });
          viralPerCategory.push(...events.map((e) => e.id));
        }
        eventIds = shuffle(viralPerCategory).slice(0, limit);
      }
    } else {
      const userId = session.user.id;
      const predictionCount = await prisma.prediction.count({
        where: { userId },
      });

      if (predictionCount < COLD_START_PREDICTIONS_THRESHOLD) {
        const categories = await prisma.event
          .findMany({
            where: baseWhere,
            select: { category: true },
            distinct: ["category"],
          })
          .then((rows) => rows.map((r) => r.category).filter(Boolean));

        if (categories.length === 0) {
          const fallback = await prisma.event.findMany({
            where: baseWhere,
            orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
            take: limit,
            select: { id: true },
          });
          eventIds = fallback.map((e) => e.id);
        } else {
          const viralPerCategory: string[] = [];
          for (const category of categories) {
            const events = await prisma.event.findMany({
              where: { ...baseWhere, category },
              orderBy: [
                { yesPredictions: "desc" },
                { totalCredits: "desc" },
                { createdAt: "desc" },
              ],
              take: COLD_START_PER_CATEGORY + 2,
              select: { id: true },
            });
            viralPerCategory.push(...events.map((e) => e.id));
          }
          eventIds = shuffle(viralPerCategory).slice(0, limit);
        }
      } else {
        const userPredictions = await prisma.prediction.findMany({
          where: { userId },
          select: { event: { select: { category: true } } },
        });
        const categoryCount = new Map<string, number>();
        for (const p of userPredictions) {
          const cat = p.event?.category;
          if (cat) categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
        }
        const preferredCategories = [...categoryCount.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, WARM_MAIN_CATEGORIES)
          .map(([c]) => c);

        const alreadyPredictedEventIds = await prisma.prediction
          .findMany({
            where: { userId },
            select: { eventId: true },
          })
          .then((rows) => new Set(rows.map((r) => r.eventId)));

        const mainLimit = Math.max(limit - WARM_DISCOVERY_COUNT, 1);
        const mainIds: string[] = [];
        if (preferredCategories.length > 0) {
          for (const category of preferredCategories) {
            const events = await prisma.event.findMany({
              where: {
                ...baseWhere,
                category,
                id: { notIn: [...alreadyPredictedEventIds] },
              },
              orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
              take: Math.ceil(mainLimit / preferredCategories.length) + 2,
              select: { id: true },
            });
            mainIds.push(...events.map((e) => e.id));
          }
        }
        const restWhere = {
          ...baseWhere,
          id: { notIn: [...alreadyPredictedEventIds, ...mainIds] },
        };
        const discovery = await prisma.event.findMany({
          where: restWhere,
          orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
          take: WARM_DISCOVERY_COUNT,
          select: { id: true },
        });
        const combined = [...mainIds, ...discovery.map((e) => e.id)];
        const seen = new Set<string>();
        eventIds = combined.filter((id) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        }).slice(0, limit);
      }

      if (eventIds.length === 0) {
        const fallback = await prisma.event.findMany({
          where: baseWhere,
          orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
          take: limit,
          select: { id: true },
        });
        eventIds = fallback.map((e) => e.id);
      }
    }

    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        _count: { select: { Prediction: true, comments: true } },
      },
    });

    const orderMap = new Map(eventIds.map((id, i) => [id, i]));
    events.sort((a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99));

    let followingSet: Set<string> = new Set();
    if (session?.user?.id && events.length > 0) {
      const follows = await prisma.eventFollower.findMany({
        where: {
          userId: session.user.id,
          eventId: { in: events.map((e) => e.id) },
        },
        select: { eventId: true },
      });
      followingSet = new Set(follows.map((f) => f.eventId));
    }

    const fomoStats = await getEventsWithStats(prisma, events.map((e) => e.id), now);

    const eventsWithMeta = events.map((event) => {
      const stats = fomoStats.get(event.id);
      const { _count, ...rest } = event;
      return {
        ...rest,
        _count: { predictions: _count.Prediction, comments: _count.comments },
        isFollowing: followingSet.has(event.id),
        fomo: stats
          ? {
              countdownMs: stats.countdownMs,
              participantsCount: stats.participantsCount,
              votesVelocity: stats.votesVelocity,
              pointsMultiplier: stats.pointsMultiplier,
              isClosingSoon: stats.isClosingSoon,
            }
          : {
              countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
              participantsCount: _count.Prediction,
              votesVelocity: 0,
              pointsMultiplier: 1.0,
              isClosingSoon: false,
            },
      };
    });

    return NextResponse.json({
      events: eventsWithMeta,
      pagination: { total: eventsWithMeta.length, limit, hasMore: false },
    });
  } catch (error) {
    console.error("Consigliati feed error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei consigliati" },
      { status: 500 }
    );
  }
}
