import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";

export const dynamic = "force-dynamic";

export interface MyPredictionEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability: number;
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
  userWinProbability: number; // 0-100: probabilità che l'utente vinca (lato su cui ha scommesso)
  userSide: "YES" | "NO";
  predictionsCount?: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const positions = await prisma.position.findMany({
      where: { userId },
      select: {
        eventId: true,
        yesShareMicros: true,
        noShareMicros: true,
      },
    });
    const allEventIds = positions.map((p) => p.eventId);
    if (allEventIds.length === 0) {
      return NextResponse.json({
        events: [],
        categories: [],
        topInLead: [],
        totalEvents: 0,
        totalCategories: 0,
      });
    }

    const events = await prisma.event.findMany({
      where: { id: { in: allEventIds } },
      include: {
        ammState: {
          select: { qYesMicros: true, qNoMicros: true, bMicros: true },
        },
        _count: { select: { Prediction: true, Trade: true } },
      },
    });

    const positionByEvent = new Map<
      string,
      { userSide: "YES" | "NO" }
    >();
    positions.forEach((p) => {
      const side =
        p.yesShareMicros > 0n && p.noShareMicros === 0n
          ? "YES"
          : p.noShareMicros > 0n && p.yesShareMicros === 0n
            ? "NO"
            : p.yesShareMicros >= p.noShareMicros
              ? "YES"
              : "NO";
      positionByEvent.set(p.eventId, { userSide: side });
    });

    const now = new Date();
    const result: MyPredictionEvent[] = events
      .filter((e) => e.closesAt > now && !e.resolved)
      .map((e) => {
        let probability = 50;
        if (e.ammState) {
          const yesMicros = priceYesMicros(
            e.ammState.qYesMicros,
            e.ammState.qNoMicros,
            e.ammState.bMicros
          );
          probability = Number((yesMicros * 100n) / SCALE);
        }
        const pos = positionByEvent.get(e.id);
        const userSide: "YES" | "NO" = pos?.userSide ?? "YES";
        const userWinProbability =
          userSide === "YES" ? probability : 100 - probability;

        return {
          id: e.id,
          title: e.title,
          category: e.category,
          closesAt: e.closesAt.toISOString(),
          probability,
          q_yes: e.q_yes,
          q_no: e.q_no,
          b: e.b,
          userWinProbability,
          userSide,
          predictionsCount: (e._count?.Prediction ?? 0) + ((e._count as { Trade?: number })?.Trade ?? 0),
        };
      });

    const categories = [...new Set(result.map((e) => e.category))].sort();
    const sortedByLead = [...result].sort(
      (a, b) => b.userWinProbability - a.userWinProbability
    );
    const topInLead = sortedByLead.slice(0, 10);

    return NextResponse.json({
      events: result,
      categories,
      topInLead,
      totalEvents: result.length,
      totalCategories: categories.length,
    });
  } catch (error) {
    console.error("Error fetching my predictions events:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento degli eventi previsti" },
      { status: 500 }
    );
  }
}
