import { NextRequest, NextResponse } from "next/server";
import { getCanonicalBaseUrl } from "@/lib/canonical-base-url";
import { prisma } from "@/lib/prisma";
import {
  getClosedUnresolvedReplicaEvents,
  resolveReplicaEventFromOfficialSource,
} from "@/lib/resolution/replica-auto-resolve";

export const dynamic = "force-dynamic";

function isAuthorized(
  request: NextRequest
): { ok: true } | { ok: false; status: number; body: object } {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  const isProduction = process.env.VERCEL === "1";

  if (isProduction && !cronSecret) {
    return {
      ok: false,
      status: 503,
      body: { error: "CRON_SECRET non configurato" },
    };
  }
  if (!cronSecret) return { ok: true };
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token !== cronSecret) {
    return { ok: false, status: 401, body: { error: "Unauthorized" } };
  }
  return { ok: true };
}

export async function GET(request: NextRequest) {
  try {
    if (process.env.DISABLE_CRON_AUTOMATION === "true" || process.env.DISABLE_CRON_AUTOMATION === "1") {
      return NextResponse.json({ error: "Cron automation disabled", code: "CRON_DISABLED" }, { status: 503 });
    }

    const auth = isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json(auth.body, { status: auth.status });
    }

    const events = await getClosedUnresolvedReplicaEvents(prisma);
    const baseUrl = getCanonicalBaseUrl();
    const cronSecret = process.env.CRON_SECRET?.trim();
    const autoResolved: Array<{ id: string; outcome: string }> = [];
    const needsReview: Array<{ id: string; reason: string }> = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const event of events) {
      const outcomeProbe = await resolveReplicaEventFromOfficialSource(event);
      if ("outcome" in outcomeProbe) {
        const res = await fetch(`${baseUrl}/api/admin/events/${event.id}/resolve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(cronSecret && { Authorization: `Bearer ${cronSecret}` }),
          },
          body: JSON.stringify({ outcome: outcomeProbe.outcome, auto: true }),
        });

        if (res.ok) {
          autoResolved.push({ id: event.id, outcome: outcomeProbe.outcome });
          continue;
        }

        const errBody = await res.json().catch(() => ({}));
        errors.push({
          id: event.id,
          error: (errBody as { error?: string }).error ?? `HTTP ${res.status}`,
        });
        await prisma.event.update({
          where: { id: event.id },
          data: { resolutionStatus: "NEEDS_REVIEW" },
        });
        continue;
      }

      if ("needsReview" in outcomeProbe) {
        needsReview.push({ id: event.id, reason: outcomeProbe.reason });
        await prisma.event.update({
          where: { id: event.id },
          data: { resolutionStatus: "NEEDS_REVIEW" },
        });
        continue;
      }

      errors.push({ id: event.id, error: outcomeProbe.error });
      await prisma.event.update({
        where: { id: event.id },
        data: { resolutionStatus: "NEEDS_REVIEW" },
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checked: events.length,
      autoResolved,
      needsReview,
      errors,
    });
  } catch (error) {
    console.error("[cron/replica-auto-resolve] error:", error);
    return NextResponse.json(
      {
        error: "Errore auto-risoluzione replica",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
