import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { getEventProbability } from "@/lib/pricing/price-display";

const CATEGORIES = [
  "Sport",
  "Politica",
  "Tecnologia",
  "Economia",
  "Cultura",
  "Scienza",
  "Intrattenimento",
];

export async function GET() {
  try {
    const now = new Date();

    const viralEvents = await Promise.all(
      CATEGORIES.map(async (category) => {
        const event = await prisma.event.findFirst({
          where: {
            category,
            status: "OPEN",
            resolved: false,
            closesAt: { gt: now },
          },
          orderBy: [
            { yesPredictions: "desc" },
            { totalCredits: "desc" },
          ],
          include: {
            ammState: { select: { qYesMicros: true, qNoMicros: true, bMicros: true } },
            _count: { select: { Prediction: true, Trade: true } },
          },
        });
        return event;
      })
    );

    const predCount = (c: { Prediction: number; Trade: number }) => (c.Prediction ?? 0) + (c.Trade ?? 0);
    const events = viralEvents
      .filter((event): event is NonNullable<typeof event> => event !== null)
      .map((e) => {
        const { ammState, _count, ...rest } = e;
        const probability =
          e.tradingMode === "AMM" && ammState
            ? Number((priceYesMicros(ammState.qYesMicros, ammState.qNoMicros, ammState.bMicros) * 100n) / SCALE)
            : getEventProbability(e);
        const count = predCount(_count as { Prediction: number; Trade: number });
        return { ...rest, probability, _count: { predictions: count } };
      });

    events.sort((a, b) => {
      const predictionsA = a._count?.predictions ?? 0;
      const predictionsB = b._count?.predictions ?? 0;
      return predictionsB - predictionsA;
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching viral events by category:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento degli eventi." },
      { status: 500 }
    );
  }
}
