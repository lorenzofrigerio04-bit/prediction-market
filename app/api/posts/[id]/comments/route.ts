import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications/create";
import { NotificationType } from "@/lib/notifications/types";

const COMMENTS_LIMIT = 20; // commenti per user per minuto

/**
 * GET /api/posts/[id]/comments — list comments for a post (top-level + replies, non-hidden).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, hidden: true },
    });

    if (!post || post.hidden) {
      return NextResponse.json(
        { error: "Post non trovato" },
        { status: 404 }
      );
    }

    const comments = await prisma.postComment.findMany({
      where: {
        postId,
        parentId: null,
        hidden: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          where: { hidden: false },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { replies: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching post comments:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei commenti" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts/[id]/comments — create a comment on a post.
 * Body: { content: string, parentId?: string }
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
        { error: "Devi essere autenticato per commentare" },
        { status: 401 }
      );
    }

    const limited = rateLimit(`post-comments:${session.user.id}`, COMMENTS_LIMIT);
    if (limited) {
      return NextResponse.json(
        { error: "Troppi commenti in poco tempo. Riprova tra un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content è obbligatorio" },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Il commento non può essere vuoto" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Il commento non può superare i 2000 caratteri" },
        { status: 400 }
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

    if (parentId) {
      const parent = await prisma.postComment.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Commento padre non trovato" },
          { status: 404 }
        );
      }
      if (parent.postId !== postId) {
        return NextResponse.json(
          { error: "Il commento padre non appartiene a questo post" },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId: session.user.id,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    });

    const commentCount = await prisma.postComment.count({
      where: { postId },
    });

    if (!parentId && post.userId !== session.user.id) {
      await createNotification(post.userId, NotificationType.POST_COMMENT, {
        postId: post.id,
        eventId: post.eventId,
        eventTitle: post.event?.title ?? undefined,
        commenterName: session.user.name ?? "Qualcuno",
      });
    }

    return NextResponse.json(
      {
        success: true,
        comment,
        commentCount,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating post comment:", error);
    const err = error as { code?: string };
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Post o utente non trovato" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Errore nella creazione del commento" },
      { status: 500 }
    );
  }
}
