import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const eventId = params.id;

    // Fetch event with all related data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            predictions: true,
            comments: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    // Get user's prediction if logged in
    let userPrediction = null;
    if (session?.user?.id) {
      userPrediction = await prisma.prediction.findUnique({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId: event.id,
          },
        },
      });
    }

    return NextResponse.json({
      event,
      userPrediction,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dell'evento" },
      { status: 500 }
    );
  }
}
