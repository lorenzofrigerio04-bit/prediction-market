import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";

const COMMENTS_LIMIT = 20; // commenti per user per minuto

// GET - Fetch comments for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId è obbligatorio" },
        { status: 400 }
      );
    }

    // Fetch all top-level comments (no parent) with replies and reactions; escludi nascosti
    const comments = await prisma.comment.findMany({
      where: {
        eventId,
        parentId: null, // Only top-level comments
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
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            _count: {
              select: {
                reactions: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei commenti" },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per commentare" },
        { status: 401 }
      );
    }

    const limited = rateLimit(`comments:${session.user.id}`, COMMENTS_LIMIT);
    if (limited) {
      return NextResponse.json(
        { error: "Troppi commenti in poco tempo. Riprova tra un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { eventId, content, parentId } = body;

    // Validazione
    if (!eventId || !content) {
      return NextResponse.json(
        { error: "eventId e content sono obbligatori" },
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

    // Verifica che l'evento esista
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    // Se parentId è fornito, verifica che il commento padre esista e appartenga allo stesso evento
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Commento padre non trovato" },
          { status: 404 }
        );
      }

      if (parentComment.eventId !== eventId) {
        return NextResponse.json(
          { error: "Il commento padre non appartiene a questo evento" },
          { status: 400 }
        );
      }
    }

    // Crea il commento
    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        eventId,
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
        reactions: true,
        _count: {
          select: {
            reactions: true,
            replies: true,
          },
        },
      },
    });

    track(
      "COMMENT_POSTED",
      { userId: session.user.id, eventId },
      { request }
    );

    // Se è una risposta, crea una notifica per l'autore del commento padre
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          event: {
            select: {
            },
          },
        },
      });

      if (parentComment && parentComment.userId !== session.user.id) {
        // Non notificare se l'utente risponde al proprio commento
        const event = await prisma.event.findUnique({
          where: { id: parentComment.eventId },
          select: { id: true, title: true },
        });
        const replier = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true },
        });
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: "COMMENT_REPLY",
            data: JSON.stringify({
              commentId: comment.id,
              eventId: parentComment.eventId,
              eventTitle: event?.title ?? "",
              replierName: replier?.name ?? "Qualcuno",
            }),
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        comment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating comment:", error);

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Evento o utente non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Errore nella creazione del commento" },
      { status: 500 }
    );
  }
}
