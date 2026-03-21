import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SPORT_CATEGORY_FILTER } from "@/lib/sport-categories";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/**
 * GET /api/feed/posts
 * Lista post del feed (Feed 2.0): paginazione limit/offset, ordinamento per data.
 * Pubblico: se non loggato restituisce i post senza isLikedByCurrentUser.
 */
export async function GET(request: NextRequest) {
  try {
    if (!prisma.post) {
      throw new Error(
        "Prisma client missing 'post' delegate. Run: npx prisma generate"
      );
    }
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);
    const typeFilter = searchParams.get("type"); // "AI_IMAGE" = only photo-descriptive posts (eventi feed)

    const where: { hidden: boolean; type?: "AI_IMAGE"; event?: object } = { hidden: false };
    if (typeFilter === "AI_IMAGE") {
      where.type = "AI_IMAGE";
    }
    where.event = { ...SPORT_CATEGORY_FILTER };

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            closesAt: true,
            probability: true,
            resolved: true,
            outcome: true,
            totalCredits: true,
            _count: { select: { Prediction: true } },
          },
        },
        _count: {
          select: { postLikes: true, postComments: true },
        },
      },
    });

    let likedPostIds: Set<string> = new Set();
    if (session?.user?.id && posts.length > 0) {
      const likes = await prisma.postLike.findMany({
        where: {
          postId: { in: posts.map((p) => p.id) },
          userId: session.user.id,
        },
        select: { postId: true },
      });
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    const postsJson = posts.map((post) => {
      const { _count, event: rawEvent, ...rest } = post;
      const event =
        rawEvent &&
        (() => {
          const { _count: eventCount, ...eventFields } = rawEvent as typeof rawEvent & { _count?: { Prediction: number } };
          return {
            ...eventFields,
            predictionsCount: eventCount?.Prediction ?? 0,
          };
        })();
      return {
        ...rest,
        event: event ?? null,
        likeCount: _count.postLikes,
        commentCount: _count.postComments,
        ...(session?.user?.id !== undefined && {
          isLikedByCurrentUser: likedPostIds.has(post.id),
        }),
      };
    });

    return NextResponse.json({
      posts: postsJson,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Feed posts error:", message, stack ?? "");
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        error: "Errore nel caricamento del feed",
        ...(isDev && { detail: message }),
      },
      { status: 500 }
    );
  }
}
