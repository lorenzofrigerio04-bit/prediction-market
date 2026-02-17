import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFeedCandidates } from "@/lib/personalization/candidate-generation";
import { rerankFeed } from "@/lib/personalization/reranking";
import { getFeedCache, setFeedCache, type CachedFeedItem } from "@/lib/feed-cache";
import { DEBUG_TITLE_PREFIX, isDebugTitle } from "@/lib/debug-display";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const CANDIDATE_POOL_SIZE = 100;
const CACHE_TTL_SEC = 5 * 60; // 5 minutes

const feedEventSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  createdAt: true,
  closesAt: true,
  probability: true,
  totalCredits: true,
  yesCredits: true,
  noCredits: true,
  resolved: true,
  outcome: true,
  q_yes: true,
  q_no: true,
  b: true,
  createdBy: {
    select: { id: true, name: true, image: true },
  },
  _count: {
    select: { predictions: true, comments: true },
  },
} as const;

/**
 * Fallback: return recent open events (same shape as feed) when personalization fails.
 * Used when MarketMetrics/UserProfile are missing or generateFeedCandidates throws.
 */
/** Hide [DEBUG] markets from normal feed. */
async function getRecentEventsAsFeed(limit: number): Promise<CachedFeedItem[]> {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      resolved: false,
      closesAt: { gt: now },
      NOT: { title: { startsWith: DEBUG_TITLE_PREFIX } },
    },
    select: feedEventSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return events as unknown as CachedFeedItem[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
      MAX_LIMIT
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);

    let fullList: CachedFeedItem[] | null = await getFeedCache(userId);

    if (!fullList) {
      try {
        const candidates = await generateFeedCandidates(prisma, userId, CANDIDATE_POOL_SIZE);
        if (candidates.length === 0) {
          fullList = await getRecentEventsAsFeed(limit + offset);
        } else {
          const eventIds = candidates.map((c) => c.eventId);
          const events = await prisma.event.findMany({
            where: {
              id: { in: eventIds },
              resolved: false,
              closesAt: { gt: new Date() },
              NOT: { title: { startsWith: DEBUG_TITLE_PREFIX } },
            },
            select: feedEventSelect,
          });

          const byId = new Map(events.map((e) => [e.id, e]));
          const ordered = eventIds.map((id) => byId.get(id)).filter(Boolean) as typeof events;
          const reranked = rerankFeed(
            ordered.map((e) => {
              const { id, ...rest } = e;
              return { eventId: id, ...rest };
            }),
            Date.now()
          );

          fullList = reranked.map(({ eventId, ...rest }) => ({
            id: eventId,
            ...rest,
          })) as CachedFeedItem[];
          await setFeedCache(userId, fullList, CACHE_TTL_SEC);
        }
      } catch (err) {
        console.warn("Feed personalization failed, using recent events:", err);
        fullList = await getRecentEventsAsFeed(MAX_LIMIT);
      }
    }

    // Ensure debug-only markets never appear in feed for normal users.
    fullList = fullList.filter((e) => !isDebugTitle(e.title));

    const total = fullList.length;
    const items = fullList.slice(offset, offset + limit);

    return NextResponse.json({
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento del feed" },
      { status: 500 }
    );
  }
}
