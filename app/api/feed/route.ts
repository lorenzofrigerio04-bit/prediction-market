import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFeedCandidates } from "@/lib/personalization/candidate-generation";
import { rerankFeed } from "@/lib/personalization/reranking";
import { getFeedCache, setFeedCache, type CachedFeedItem } from "@/lib/feed-cache";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const CANDIDATE_POOL_SIZE = 100;
const CACHE_TTL_SEC = 5 * 60; // 5 minutes

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

    let fullList = await getFeedCache(userId);

    if (!fullList) {
      const candidates = await generateFeedCandidates(prisma, userId, CANDIDATE_POOL_SIZE);
      if (candidates.length === 0) {
        return NextResponse.json({
          items: [],
          pagination: { total: 0, limit, offset, hasMore: false },
        });
      }

      const eventIds = candidates.map((c) => c.eventId);
      const events = await prisma.event.findMany({
        where: {
          id: { in: eventIds },
          resolved: false,
          closesAt: { gt: new Date() },
        },
        select: {
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
        },
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
