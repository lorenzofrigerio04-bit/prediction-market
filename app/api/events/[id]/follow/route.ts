import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { updateMissionProgress } from "@/lib/missions";
import { handleMissionEvent } from "@/lib/missions/mission-progress-service";

/**
 * GET /api/events/[id]/follow — returns { isFollowing }
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato" },
        { status: 401 }
      );
    }

    const follow = await prisma.eventFollower.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });

    return NextResponse.json({
      isFollowing: !!follow,
    });
  } catch (error) {
    console.error("Error fetching follow status:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[id]/follow — toggle follow (Segui / Non seguire più)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per seguire un evento" },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    const existing = await prisma.eventFollower.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });

    if (existing) {
      await prisma.eventFollower.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        isFollowing: false,
      });
    } else {
      await prisma.eventFollower.create({
        data: {
          userId: session.user.id,
          eventId,
        },
      });
      updateMissionProgress(prisma, session.user.id, "FOLLOW_EVENTS", 1).catch((e) =>
        console.error("Mission progress update error:", e)
      );
      handleMissionEvent(prisma, session.user.id, "FOLLOW_EVENT", { eventId }).catch((e) =>
        console.error("Mission event (follow) error:", e)
      );
      track("EVENT_FOLLOWED", { userId: session.user.id, eventId }, { request });
      return NextResponse.json({
        success: true,
        isFollowing: true,
      });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento" },
      { status: 500 }
    );
  }
}
