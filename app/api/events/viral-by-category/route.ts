import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
          select: {
            id: true,
            title: true,
            category: true,
            closesAt: true,
            probability: true,
            q_yes: true,
            q_no: true,
            b: true,
            _count: {
              select: {
                predictions: true,
              },
            },
          },
        });
        return event;
      })
    );

    const events = viralEvents.filter(
      (event): event is NonNullable<typeof event> => event !== null
    );

    events.sort((a, b) => {
      const predictionsA = a._count?.predictions || 0;
      const predictionsB = b._count?.predictions || 0;
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
