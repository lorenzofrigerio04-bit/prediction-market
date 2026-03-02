import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications/create";
import { NotificationType } from "@/lib/notifications/types";

/**
 * POST /api/posts/[id]/like — toggle like (create or remove PostLike).
 * Returns { likeCount, isLiked }.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per mettere like" },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        eventId: true,
        hidden: true,
        event: { select: { title: true } },
      },
    });

    if (!post || post.hidden) {
      return NextResponse.json(
        { error: "Post non trovato" },
        { status: 404 }
      );
    }

    const existing = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      await prisma.postLike.delete({
        where: { id: existing.id },
      });
      const likeCount = await prisma.postLike.count({
        where: { postId },
      });
      return NextResponse.json({
        likeCount,
        isLiked: false,
      });
    }

    await prisma.postLike.create({
      data: {
        postId,
        userId: session.user.id,
      },
    });

    if (post.userId !== session.user.id) {
      await createNotification(post.userId, NotificationType.POST_LIKE, {
        postId: post.id,
        eventId: post.eventId,
        eventTitle: post.event?.title ?? undefined,
        likerName: session.user.name ?? "Qualcuno",
      });
    }

    const likeCount = await prisma.postLike.count({
      where: { postId },
    });
    return NextResponse.json({
      likeCount,
      isLiked: true,
    });
  } catch (error) {
    console.error("Post like error:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento del like" },
      { status: 500 }
    );
  }
}
