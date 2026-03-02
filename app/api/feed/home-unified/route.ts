import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import type { SistemaEvent, LentePost, UnifiedFeedItem } from "@/types/home-unified-feed";

export const dynamic = "force-dynamic";

const SISTEMA_LIMIT = 24;
const LENTE_LIMIT = 12;
/** Pattern interleave: ogni LENTE_EVERY item, inseriamo un post lente */
const LENTE_EVERY = 3;

/**
 * GET /api/feed/home-unified
 * Feed unificato per homepage: eventi Sistema + eventi Lente (post con commento) interleaved.
 * - Eventi sistema: eventi senza foto AI, raggruppati per categoria poi flatten
 * - Eventi lente: post AI_IMAGE con commento autore
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const now = new Date();

    // 1) Eventi sistema: eventi SENZA post AI_IMAGE
    const eventIdsWithAiPhoto = await prisma.post
      .findMany({
        where: { type: "AI_IMAGE", aiImageUrl: { not: null } },
        select: { eventId: true },
        distinct: ["eventId"],
      })
      .then((rows) => new Set(rows.map((r) => r.eventId)));

    const sistemaRaw = await prisma.event.findMany({
      where: {
        category: { not: "News" },
        resolved: false,
        closesAt: { gt: now },
        id: { notIn: Array.from(eventIdsWithAiPhoto) },
      },
      orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
      take: 500,
      include: {
        _count: { select: { Prediction: true, Trade: true } },
        ammState: {
          select: { qYesMicros: true, qNoMicros: true, bMicros: true },
        },
      },
    });

    const predictionsCount = (c: { Prediction: number; Trade?: number }) =>
      (c.Prediction ?? 0) + (c.Trade ?? 0);

    const sistemaEvents: SistemaEvent[] = sistemaRaw.slice(0, SISTEMA_LIMIT).map((e) => {
      const predCount = predictionsCount(e._count as { Prediction: number; Trade: number });
      let probability = 50;
      if (e.ammState) {
        const yesMicros = priceYesMicros(
          e.ammState.qYesMicros,
          e.ammState.qNoMicros,
          e.ammState.bMicros
        );
        probability = Number((yesMicros * 100n) / SCALE);
      }
      return {
        id: e.id,
        title: e.title,
        category: e.category ?? "Altro",
        closesAt: e.closesAt.toISOString(),
        yesPct: Math.round(probability ?? 50),
        predictionsCount: predCount,
      };
    });

    // 2) Eventi lente: post AI_IMAGE con commento
    const postsRaw = await prisma.post.findMany({
      where: {
        hidden: false,
        type: "AI_IMAGE",
        aiImageUrl: { not: null },
        content: { not: null },
        event: {
          resolved: false,
          closesAt: { gt: now },
        },
      },
      orderBy: { createdAt: "desc" },
      take: LENTE_LIMIT,
      include: {
        user: { select: { id: true, name: true, image: true } },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            closesAt: true,
            _count: { select: { Prediction: true } },
            ammState: {
              select: { qYesMicros: true, qNoMicros: true, bMicros: true },
            },
          },
        },
        _count: { select: { postLikes: true, postComments: true } },
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

    const lentePosts: LentePost[] = postsRaw.map((post) => {
      const rawEvent = post.event as {
        _count?: { Prediction: number };
        ammState?: { qYesMicros: bigint; qNoMicros: bigint; bMicros: bigint };
        closesAt: Date;
      } & typeof post.event;
      let probability = 50;
      if (rawEvent?.ammState) {
        const yesMicros = priceYesMicros(
          rawEvent.ammState.qYesMicros,
          rawEvent.ammState.qNoMicros,
          rawEvent.ammState.bMicros
        );
        probability = Number((yesMicros * 100n) / SCALE);
      }
      const event = rawEvent
        ? {
            id: rawEvent.id,
            title: rawEvent.title,
            category: rawEvent.category ?? "Evento",
            closesAt: rawEvent.closesAt.toISOString(),
            probability,
            predictionsCount: rawEvent._count?.Prediction ?? 0,
          }
        : null;
      return {
        id: post.id,
        content: post.content,
        aiImageUrl: post.aiImageUrl,
        createdAt: post.createdAt.toISOString(),
        user: post.user,
        event: event!,
        likeCount: post._count.postLikes,
        commentCount: post._count.postComments,
        ...(session?.user?.id && {
          isLikedByCurrentUser: likedPostIds.has(post.id),
        }),
      };
    });

    // 3) Interleave: [sistema, sistema, lente, sistema, sistema, lente, ...]
    const items: UnifiedFeedItem[] = [];
    let si = 0;
    let li = 0;
    let nextLenteAt = LENTE_EVERY - 1; // primo lente dopo 2 sistema
    while (si < sistemaEvents.length || li < lentePosts.length) {
      if (li < lentePosts.length && items.length === nextLenteAt) {
        items.push({ type: "lente", data: lentePosts[li++] });
        nextLenteAt += LENTE_EVERY;
      } else if (si < sistemaEvents.length) {
        items.push({ type: "sistema", data: sistemaEvents[si++] });
      } else if (li < lentePosts.length) {
        items.push({ type: "lente", data: lentePosts[li++] });
      } else break;
    }

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Feed home-unified error:", message);
    return NextResponse.json(
      { error: "Errore nel caricamento del feed" },
      { status: 500 }
    );
  }
}
