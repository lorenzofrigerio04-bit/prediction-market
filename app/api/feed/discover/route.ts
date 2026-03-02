import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * GET /api/feed/discover
 * Feed dedicato alla pagina "lente" (Discover): prioritariamente i 100 eventi generati dall'AI
 * con immagine, commento, ecc. (post type AI_IMAGE, source BOT).
 * Restituisce solo post (no interleave con eventi) per mostrare il contenuto AI completo.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) ||
        DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);

    const postsRaw = await prisma.post.findMany({
      where: {
        hidden: false,
        type: "AI_IMAGE",
        aiImageUrl: { not: null },
        event: {
          resolved: false,
          closesAt: { gt: new Date() },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        user: { select: { id: true, name: true, image: true } },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            closesAt: true,
            resolved: true,
            outcome: true,
            totalCredits: true,
            _count: { select: { Prediction: true } },
            ammState: {
              select: { qYesMicros: true, qNoMicros: true, bMicros: true },
            },
          },
        },
        _count: {
          select: { postLikes: true, postComments: true },
        },
      },
    });

    let likedPostIds: Set<string> = new Set();
    if (session?.user?.id && postsRaw.length > 0) {
      const likes = await prisma.postLike.findMany({
        where: {
          postId: { in: postsRaw.map((p) => p.id) },
          userId: session.user.id,
        },
        select: { postId: true },
      });
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    const posts = postsRaw.map((post) => {
      const { _count, event: rawEvent, ...rest } = post;
      let probability = 50;
      if (rawEvent) {
        const ammState = (rawEvent as { ammState?: { qYesMicros: bigint; qNoMicros: bigint; bMicros: bigint } }).ammState;
        if (ammState) {
          const yesMicros = priceYesMicros(
            ammState.qYesMicros,
            ammState.qNoMicros,
            ammState.bMicros
          );
          probability = Number((yesMicros * 100n) / SCALE);
        }
      }
      const event =
        rawEvent &&
        (() => {
          const {
            _count: eventCount,
            ammState: _amm,
            ...eventFields
          } = rawEvent as typeof rawEvent & { _count?: { Prediction: number }; ammState?: unknown };
          return {
            ...eventFields,
            probability,
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

    const items = posts.map((p) => ({ type: "post" as const, data: p }));

    return NextResponse.json({
      items,
      hasMore: posts.length >= limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Feed discover error:", message, stack ?? "");
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
