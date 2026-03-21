import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPostType } from "@/lib/feed/post-type";
import { createNotification } from "@/lib/notifications/create";
import { NotificationType } from "@/lib/notifications/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/posts
 * Crea un post nel feed (pubblicazione o ripubblicazione).
 * Body: { eventId: string, content?: string | null, source?: "CREATED_BY_ME" | "REPOST" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    let body: { eventId?: string; content?: string | null; source?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Body JSON non valido" },
        { status: 400 }
      );
    }

    const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
    if (!eventId) {
      return NextResponse.json(
        { error: "eventId obbligatorio" },
        { status: 400 }
      );
    }

    const content =
      body.content != null && typeof body.content === "string"
        ? body.content.trim() || null
        : null;

    const source =
      body.source === "REPOST" ? "REPOST" : "CREATED_BY_ME";

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, category: true, description: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    const type = getPostType(
      {
        id: event.id,
        title: event.title,
        category: event.category ?? "",
        description: event.description,
      },
      content,
      source
    );

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        eventId,
        content,
        type,
        source,
        aiImageUrl: type === "AI_IMAGE" ? null : undefined,
      },
    });

    if (source === "REPOST") {
      const previousPublishers = await prisma.post.findMany({
        where: {
          eventId,
          source: "CREATED_BY_ME",
          userId: { not: session.user.id },
        },
        select: { userId: true },
      });
      const uniqueUserIds = [...new Set(previousPublishers.map((p) => p.userId))];
      const reposterName = session.user.name ?? "Qualcuno";
      for (const userId of uniqueUserIds) {
        await createNotification(userId, NotificationType.POST_REPOST, {
          postId: post.id,
          eventId,
          eventTitle: event.title ?? "",
          reposterName,
        });
      }
    }

    return NextResponse.json(
      {
        id: post.id,
        type: post.type,
        content: post.content,
        eventId: post.eventId,
        createdAt: post.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/posts]", err);
    return NextResponse.json(
      { error: "Errore durante la creazione del post" },
      { status: 500 }
    );
  }
}
