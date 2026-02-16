import { NextRequest, NextResponse } from "next/server";
import { getCanonicalBaseUrl } from "@/lib/canonical-base-url";
import { prisma } from "@/lib/prisma";
import {
  getClosedUnresolvedEvents,
  checkResolutionSource,
} from "@/lib/resolution/auto-resolve";

export const dynamic = "force-dynamic";

/** Verify Authorization: Bearer with CRON_SECRET. */
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
  if (!cronSecret) {
    return { ok: true };
  }
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token !== cronSecret) {
    return { ok: false, status: 401, body: { error: "Unauthorized" } };
  }
  return { ok: true };
}

/**
 * GET /api/cron/auto-resolve
 * Checks closed markets (closesAt <= now, resolved = false) against resolutionSourceUrl.
 * - If outcome is clear (YES/NO): auto-resolves via POST /api/admin/events/[id]/resolve with auto=true.
 * - If uncertain or error: sets resolutionStatus to NEEDS_REVIEW.
 * Schedule: run every 15 minutes (e.g. Vercel Cron: 0,15,30,45 * * * *).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json(auth.body, { status: auth.status });
    }

    const events = await getClosedUnresolvedEvents(prisma);
    const baseUrl = getCanonicalBaseUrl();
    const cronSecret = process.env.CRON_SECRET?.trim();

    const autoResolved: { id: string; title: string; outcome: "YES" | "NO" }[] =
      [];
    const needsReview: { id: string; title: string; reason?: string }[] = [];
    const errors: { id: string; title: string; error: string }[] = [];

    for (const event of events) {
      if (!event.resolutionSourceUrl?.trim()) {
        needsReview.push({
          id: event.id,
          title: event.title,
          reason: "missing resolution source URL",
        });
        await prisma.event.update({
          where: { id: event.id },
          data: { resolutionStatus: "NEEDS_REVIEW" },
        });
        continue;
      }

      const result = await checkResolutionSource(event.resolutionSourceUrl);

      if ("outcome" in result && (result.outcome === "YES" || result.outcome === "NO")) {
        const res = await fetch(
          `${baseUrl}/api/admin/events/${event.id}/resolve`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(cronSecret && {
                Authorization: `Bearer ${cronSecret}`,
              }),
            },
            body: JSON.stringify({
              outcome: result.outcome,
              auto: true,
            }),
          }
        );
        if (res.ok) {
          autoResolved.push({
            id: event.id,
            title: event.title,
            outcome: result.outcome,
          });
        } else {
          const errBody = await res.json().catch(() => ({}));
          errors.push({
            id: event.id,
            title: event.title,
            error: (errBody as { error?: string }).error ?? `HTTP ${res.status}`,
          });
          await prisma.event.update({
            where: { id: event.id },
            data: { resolutionStatus: "NEEDS_REVIEW" },
          });
        }
        continue;
      }

      if ("needsReview" in result && result.needsReview) {
        needsReview.push({
          id: event.id,
          title: event.title,
          reason: "outcome uncertain from source",
        });
        await prisma.event.update({
          where: { id: event.id },
          data: { resolutionStatus: "NEEDS_REVIEW" },
        });
        continue;
      }

      if ("error" in result) {
        errors.push({
          id: event.id,
          title: event.title,
          error: result.error,
        });
        await prisma.event.update({
          where: { id: event.id },
          data: { resolutionStatus: "NEEDS_REVIEW" },
        });
      }
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
    console.error("[cron/auto-resolve] error:", error);
    return NextResponse.json(
      {
        error: "Errore auto-resoluzione",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
