import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, active, won, lost
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause based on filter
    const where: any = { userId };
    
    if (filter === "active") {
      where.resolved = false;
    } else if (filter === "won") {
      where.resolved = true;
      where.won = true;
    } else if (filter === "lost") {
      where.resolved = true;
      where.won = false;
    }

    // Fetch predictions with event info
    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              category: true,
              resolved: true,
              outcome: true,
              closesAt: true,
              resolvedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.prediction.count({ where }),
    ]);

    return NextResponse.json({
      Prediction: predictions.map((p) => ({
        id: p.id,
        outcome: p.outcome,
        credits: p.credits,
        resolved: p.resolved,
        won: p.won,
        payout: p.payout,
        createdAt: p.createdAt,
        event: {
          id: p.event.id,
          category: p.event.category,
          resolved: p.event.resolved,
          outcome: p.event.outcome,
          closesAt: p.event.closesAt,
        },
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching Prediction:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle previsioni" },
      { status: 500 }
    );
  }
}
