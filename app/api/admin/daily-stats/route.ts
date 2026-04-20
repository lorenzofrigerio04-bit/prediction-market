import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export interface FieRun {
  runAt: string;
  eventsCreated: number;
  durationMs: number | null;
  diagnostics: {
    radarMatchCount?: number;
    brainApprovedCount?: number;
    forgeCandidateCount?: number;
  } | null;
}

export interface DailyStatsPayload {
  date: string; // YYYY-MM-DD (local Europe/Rome)
  fie: {
    eventsToday: number;
    runsToday: number;
    lastRunAt: string | null;
    lastRunEventsCreated: number;
    lastRunDurationMs: number | null;
    nextRunAt: string; // ISO of next scheduled run (every 8h: 00, 08, 16 UTC)
    runs: FieRun[];
  };
  totalSportEventsActive: number;
}

// Returns the next UTC cron slot (every 8 hours: 00:00, 08:00, 16:00 UTC).
function nextFieCronRun(now: Date): Date {
  const h = now.getUTCHours();
  const slots = [0, 8, 16, 24];
  const nextH = slots.find((s) => s > h) ?? 24;
  const next = new Date(now);
  next.setUTCHours(nextH % 24, 0, 0, 0);
  if (nextH === 24) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
    }

    const now = new Date();

    // Today window in UTC (midnight to midnight)
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);

    // ── FIE audit log runs for today ─────────────────────────────────────────
    const auditRows = await prisma.auditLog.findMany({
      where: {
        action: "FIE_CRON_RUN",
        createdAt: { gte: startOfDay },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, payload: true },
    });

    const runs: FieRun[] = auditRows.map((row) => {
      let eventsCreated = 0;
      let durationMs: number | null = null;
      let diagnostics: FieRun["diagnostics"] = null;
      try {
        const p = JSON.parse(row.payload ?? "{}") as Record<string, unknown>;
        eventsCreated = typeof p.eventsCreated === "number" ? p.eventsCreated : 0;
        durationMs = typeof p.durationMs === "number" ? p.durationMs : null;
        if (p.diagnostics && typeof p.diagnostics === "object") {
          const d = p.diagnostics as Record<string, unknown>;
          diagnostics = {
            radarMatchCount: typeof d.radarMatchCount === "number" ? d.radarMatchCount : undefined,
            brainApprovedCount: typeof d.brainApprovedCount === "number" ? d.brainApprovedCount : undefined,
            forgeCandidateCount: typeof d.forgeCandidateCount === "number" ? d.forgeCandidateCount : undefined,
          };
        }
      } catch {
        // ignore parse errors
      }
      return {
        runAt: row.createdAt.toISOString(),
        eventsCreated,
        durationMs,
        diagnostics,
      };
    });

    const eventsToday = runs.reduce((sum, r) => sum + r.eventsCreated, 0);
    const lastRun = runs.length > 0 ? runs[runs.length - 1] : null;

    // ── Total active SPORT events ────────────────────────────────────────────
    const totalSportEventsActive = await prisma.event.count({
      where: {
        sourceType: "SPORT",
        hidden: false,
        status: "OPEN",
        resolved: false,
        closesAt: { gt: now },
      },
    });

    const payload: DailyStatsPayload = {
      date: startOfDay.toISOString().slice(0, 10),
      fie: {
        eventsToday,
        runsToday: runs.length,
        lastRunAt: lastRun?.runAt ?? null,
        lastRunEventsCreated: lastRun?.eventsCreated ?? 0,
        lastRunDurationMs: lastRun?.durationMs ?? null,
        nextRunAt: nextFieCronRun(now).toISOString(),
        runs,
      },
      totalSportEventsActive,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[admin/daily-stats]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
