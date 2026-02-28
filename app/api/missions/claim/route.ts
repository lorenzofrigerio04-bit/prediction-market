import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { claimMission } from "@/lib/missions/reward-service";

/**
 * POST /api/missions/claim
 * Body: { userMissionId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const userMissionId =
      typeof body.userMissionId === "string" ? body.userMissionId.trim() : null;
    if (!userMissionId) {
      return NextResponse.json(
        { error: "userMissionId obbligatorio" },
        { status: 400 }
      );
    }

    const result = await claimMission(prisma, session.user.id, userMissionId);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("non trovata") || msg.includes("non autorizzata")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (msg.includes("già riscattata") || msg.includes("non ancora completata")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error("Mission claim error:", error);
    return NextResponse.json(
      { error: "Errore nel riscatto della missione" },
      { status: 500 }
    );
  }
}
