import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEventsWithStats } from "@/lib/fomo/event-stats";

export const dynamic = "force-dynamic";

const CONSIGLIATI_LIMIT = 30;
const MAX_LIMIT = 50;
const COLD_START_PREDICTIONS_THRESHOLD = 5;
const WARM_MAIN_CATEGORIES = 4;
/** Warm feed: ~70% dalle categorie preferite, ~30% da altre categorie (discovery). */
const WARM_PREFERRED_RATIO = 0.7;

const viralOrderBy = [
  { yesPredictions: "desc" as const },
  { totalCredits: "desc" as const },
  { createdAt: "desc" as const },
];

/**
 * GET /api/events/consigliati
 * - categories (opzionale): comma-separated; se presente restituisce TUTTI gli eventi
 *   di quelle categorie in ordine di viralità, paginati (per visione generale + filtri).
 * - Senza categories: feed personalizzato (cold = viral; warm = 70% gusti, 30% random).
 * - offset/limit per scroll infinito (nessun limite al numero totale di eventi).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(CONSIGLIATI_LIMIT), 10) || CONSIGLIATI_LIMIT,
      MAX_LIMIT
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);
    const categoriesParam = searchParams.get("categories")?.trim();
    const filterCategories =
      categoriesParam?.length
        ? categoriesParam.split(",").map((c) => c.trim()).filter(Boolean)
        : null;

    const now = new Date();
    const baseWhere = {
      resolved: false,
      status: "OPEN" as const,
      closesAt: { gt: now },
      category: { not: "News" as const },
    };

    let eventIds: string[];
    let totalForHasMore: number | null = null;

    // --- Modalità filtri categoria: tutti gli eventi di quelle categorie, ordinati per viralità ---
    if (filterCategories && filterCategories.length > 0) {
      const where = { ...baseWhere, category: { in: filterCategories } };
      const [count, rows] = await Promise.all([
        prisma.event.count({ where }),
        prisma.event.findMany({
          where,
          orderBy: viralOrderBy,
          skip: offset,
          take: limit,
          select: { id: true },
        }),
      ]);
      totalForHasMore = count;
      eventIds = rows.map((r) => r.id);
    } else {
      // --- Feed personalizzato (no filtro categoria) ---
      if (!session?.user?.id) {
        // Cold: ordine viral globale, paginato
        const rows = await prisma.event.findMany({
          where: baseWhere,
          orderBy: viralOrderBy,
          skip: offset,
          take: limit,
          select: { id: true },
        });
        eventIds = rows.map((r) => r.id);
        totalForHasMore = null;
      } else {
        const userId = session.user.id;
        const predictionCount = await prisma.prediction.count({ where: { userId } });

        if (predictionCount < COLD_START_PREDICTIONS_THRESHOLD) {
          // Cold (loggato ma poche previsioni): come non loggato
          const rows = await prisma.event.findMany({
            where: baseWhere,
            orderBy: viralOrderBy,
            skip: offset,
            take: limit,
            select: { id: true },
          });
          eventIds = rows.map((r) => r.id);
          totalForHasMore = null;
        } else {
          // Warm: 70% categorie preferite, 30% altre categorie (discovery)
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

          const preferredTake = Math.ceil(limit * WARM_PREFERRED_RATIO);
          const otherTake = limit - preferredTake;
          const preferredSkip = Math.floor(offset * WARM_PREFERRED_RATIO);
          const otherSkip = Math.floor(offset * (1 - WARM_PREFERRED_RATIO));

          const preferredWhere =
            preferredCategories.length > 0
              ? {
                  ...baseWhere,
                  category: { in: preferredCategories },
                  id: { notIn: [...alreadyPredictedEventIds] },
                }
              : null;
          const otherWhere = {
            ...baseWhere,
            id: { notIn: [...alreadyPredictedEventIds] },
            ...(preferredCategories.length > 0
              ? { category: { notIn: preferredCategories } }
              : {}),
          };

          let preferredIds: string[] = [];
          let otherIds: string[] = [];

          if (preferredWhere) {
            const preferredRows = await prisma.event.findMany({
              where: preferredWhere,
              orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
              skip: preferredSkip,
              take: preferredTake,
              select: { id: true },
            });
            preferredIds = preferredRows.map((r) => r.id);
          }
          const otherRows = await prisma.event.findMany({
            where: otherWhere,
            orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
            skip: otherSkip,
            take: otherTake,
            select: { id: true },
          });
          otherIds = otherRows.map((r) => r.id);

          // Interleave: 2 preferred, 1 other, 2 preferred, 1 other, ...
          eventIds = [];
          let pi = 0;
          let oi = 0;
          const ratio = 2; // 2 pref : 1 other ≈ 67/33, con preferredTake/otherTake già 70/30
          for (let i = 0; i < limit && (pi < preferredIds.length || oi < otherIds.length); i++) {
            const usePreferred =
              oi >= otherIds.length ||
              (pi < preferredIds.length && (i % (ratio + 1) !== ratio));
            if (usePreferred && pi < preferredIds.length) {
              eventIds.push(preferredIds[pi++]);
            } else if (oi < otherIds.length) {
              eventIds.push(otherIds[oi++]);
            } else if (pi < preferredIds.length) {
              eventIds.push(preferredIds[pi++]);
            }
          }
          totalForHasMore = null;
        }
      }

      if (eventIds.length === 0 && offset === 0) {
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
        _count: { select: { Prediction: true, Trade: true, comments: true } },
      },
    });

    const orderMap = new Map(eventIds.map((id, i) => [id, i]));
    events.sort((a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99));

    // Massimo 2 eventi consecutivi stessa categoria solo per feed personalizzato (no filtro categoria)
    if (!filterCategories || filterCategories.length === 0) {
      const noMoreThanTwoSameCategory = <T extends { category: string }>(arr: T[]): T[] => {
        if (arr.length <= 2) return arr;
        const result: T[] = [];
        const byCategory = new Map<string, T[]>();
        for (const e of arr) {
          const list = byCategory.get(e.category) ?? [];
          list.push(e);
          byCategory.set(e.category, list);
        }
        const categories = [...byCategory.keys()];
        let last1: string | null = null;
        let last2: string | null = null;
        let remaining = arr.length;
        while (remaining > 0) {
          let chosen: T | null = null;
          for (const cat of categories) {
            const list = byCategory.get(cat)!;
            if (list.length === 0) continue;
            const wouldRepeatThree = last1 === cat && last2 === cat;
            if (!wouldRepeatThree) {
              chosen = list.shift()!;
              break;
            }
          }
          if (!chosen) {
            const firstNonEmpty = categories.find((c) => (byCategory.get(c)?.length ?? 0) > 0);
            if (firstNonEmpty) chosen = byCategory.get(firstNonEmpty)!.shift()!;
          }
          if (!chosen) break;
          result.push(chosen);
          last2 = last1;
          last1 = chosen.category;
          remaining--;
        }
        return result;
      };
      const reordered = noMoreThanTwoSameCategory(events);
      events.length = 0;
      events.push(...reordered);
    }

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

    const predictionsCount = (c: { Prediction: number; Trade: number }) => (c.Prediction ?? 0) + (c.Trade ?? 0);
    const eventsWithMeta = events.map((event) => {
      const stats = fomoStats.get(event.id);
      const { _count, ...rest } = event;
      const predCount = predictionsCount(_count as { Prediction: number; Trade: number });
      return {
        ...rest,
        _count: { predictions: predCount, comments: _count.comments },
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
              participantsCount: predCount,
              votesVelocity: 0,
              pointsMultiplier: 1.0,
              isClosingSoon: false,
            },
      };
    });

    const hasMore =
      totalForHasMore !== null
        ? offset + eventsWithMeta.length < totalForHasMore
        : eventsWithMeta.length === limit;

    return NextResponse.json({
      events: eventsWithMeta,
      pagination: {
        total: totalForHasMore ?? undefined,
        limit,
        offset,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Consigliati feed error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei consigliati" },
      { status: 500 }
    );
  }
}
