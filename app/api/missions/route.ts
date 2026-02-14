import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureUserMissionsForPeriod } from "@/lib/missions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/missions
 * Restituisce le missioni attive (giornaliere e settimanali) con il progresso dell'utente.
 */
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
    const [missions, user] = await Promise.all([
      ensureUserMissionsForPeriod(prisma, userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true },
      }),
    ]);

    const STREAK_CAP = 10;
    const bonusMultiplier =
      Math.round(
        Math.min(2, 1 + Math.min(user?.streak ?? 0, STREAK_CAP) * 0.1) * 100
      ) / 100;

    const formatted = missions.map((um) => ({
      id: um.id,
      missionId: um.missionId,
      name: um.mission.name,
      description: um.mission.description,
      type: um.mission.type,
      target: um.mission.target,
      reward: um.mission.reward,
      period: um.mission.period,
      progress: um.progress,
      completed: um.completed,
      completedAt: um.completedAt,
      periodStart: um.periodStart,
    }));

    return NextResponse.json({
      missions: formatted,
      daily: formatted.filter((m) => m.period === "DAILY"),
      weekly: formatted.filter((m) => m.period === "WEEKLY"),
      streak: user?.streak ?? 0,
      bonusMultiplier,
    });
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle missioni" },
      { status: 500 }
    );
  }
}
