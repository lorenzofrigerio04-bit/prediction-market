/**
 * SENTINEL — Layer 4 of the Football Intelligence Engine.
 *
 * Orchestrates post-publication monitoring and resolution:
 * 1. Fetches sport events ready for resolution (closed + buffer elapsed)
 * 2. Updates live match statuses
 * 3. Routes each event to the appropriate Oracle level (L1/L2/L3)
 * 4. Triggers resolution or flags for admin review
 * 5. Logs every action to AuditLog
 */

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getCanonicalBaseUrl } from "@/lib/canonical-base-url";
import {
  resolveEvent,
  isBufferElapsed,
  classifyOracleLevel,
  getMarketKind,
  type SportEventForOracle,
  type OracleResult,
} from "./oracle";
import { checkLiveMatches, syncFinishedMatches } from "./live-monitor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SentinelResult {
  timestamp: string;
  durationMs: number;
  liveMonitor: {
    checkedEvents: number;
    updatedEvents: number;
    transitions: Array<{ eventId: string; oldStatus: string | null; newStatus: string }>;
  };
  resolution: {
    eligible: number;
    autoResolved: Array<{ eventId: string; outcome: string; level: number }>;
    needsReview: Array<{ eventId: string; reason: string; level: number; proposedOutcome?: string }>;
    skipped: Array<{ eventId: string; reason: string }>;
    errors: Array<{ eventId: string; error: string }>;
  };
}

// ---------------------------------------------------------------------------
// Core: fetch events eligible for resolution
// ---------------------------------------------------------------------------

async function fetchEligibleSportEvents(): Promise<SportEventForOracle[]> {
  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      sourceType: "SPORT",
      resolved: false,
      status: "OPEN",
      closesAt: { lte: now },
      resolutionStatus: { not: "RESOLVED" },
    },
    select: {
      id: true,
      title: true,
      closesAt: true,
      resolutionBufferHours: true,
      footballDataMatchId: true,
      marketType: true,
      templateId: true,
      creationMetadata: true,
      matchStatus: true,
    },
    orderBy: { closesAt: "asc" },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    closesAt: e.closesAt,
    resolutionBufferHours: e.resolutionBufferHours,
    footballDataMatchId: e.footballDataMatchId,
    marketType: e.marketType,
    templateId: e.templateId,
    creationMetadata: (e.creationMetadata as Record<string, unknown>) ?? null,
    matchStatus: e.matchStatus,
  }));
}

// ---------------------------------------------------------------------------
// Core: trigger resolution via admin endpoint
// ---------------------------------------------------------------------------

async function triggerAutoResolve(
  eventId: string,
  outcome: string
): Promise<{ ok: boolean; error?: string }> {
  const baseUrl = getCanonicalBaseUrl();
  const cronSecret = process.env.CRON_SECRET?.trim();

  try {
    const res = await fetch(
      `${baseUrl}/api/admin/events/${eventId}/resolve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cronSecret && { Authorization: `Bearer ${cronSecret}` }),
        },
        body: JSON.stringify({ outcome, auto: true }),
      }
    );

    if (res.ok) return { ok: true };

    const body = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: (body as { error?: string }).error ?? `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

export async function runSentinel(): Promise<SentinelResult> {
  const startTime = Date.now();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  SENTINEL — Resolution Orchestrator Start");
  console.log("═══════════════════════════════════════════════════════════");

  const result: SentinelResult = {
    timestamp: new Date().toISOString(),
    durationMs: 0,
    liveMonitor: { checkedEvents: 0, updatedEvents: 0, transitions: [] },
    resolution: {
      eligible: 0,
      autoResolved: [],
      needsReview: [],
      skipped: [],
      errors: [],
    },
  };

  // ── Phase 1: Live Monitor ──────────────────────────────────────
  console.log("\n▶ Phase 1: Live Match Status Update");
  try {
    const [liveResult, finishedResult] = await Promise.all([
      checkLiveMatches(),
      syncFinishedMatches(),
    ]);

    result.liveMonitor = {
      checkedEvents: liveResult.checkedEvents + finishedResult.checkedEvents,
      updatedEvents: liveResult.updatedEvents + finishedResult.updatedEvents,
      transitions: [
        ...liveResult.transitions.map((t) => ({
          eventId: t.eventId,
          oldStatus: t.oldStatus,
          newStatus: t.newStatus,
        })),
        ...finishedResult.transitions.map((t) => ({
          eventId: t.eventId,
          oldStatus: t.oldStatus,
          newStatus: t.newStatus,
        })),
      ],
    };

    console.log(
      `  ✓ Checked ${result.liveMonitor.checkedEvents} events, updated ${result.liveMonitor.updatedEvents}`
    );
  } catch (err) {
    console.warn(
      "[SENTINEL] Live monitor failed (non-fatal):",
      err instanceof Error ? err.message : err
    );
  }

  // ── Phase 2: Fetch eligible events ─────────────────────────────
  console.log("\n▶ Phase 2: Fetch Eligible Events for Resolution");
  const allEvents = await fetchEligibleSportEvents();

  // Filter to only events whose buffer has elapsed
  const eligible = allEvents.filter((e) => isBufferElapsed(e));
  const notReady = allEvents.length - eligible.length;

  result.resolution.eligible = eligible.length;
  console.log(
    `  Found ${allEvents.length} closed sport events — ${eligible.length} buffer-elapsed, ${notReady} not ready`
  );

  if (eligible.length === 0) {
    result.durationMs = Date.now() - startTime;
    console.log("\n  No events to resolve. Sentinel complete.");
    return result;
  }

  // ── Phase 3: Oracle Resolution ─────────────────────────────────
  console.log(`\n▶ Phase 3: Oracle Resolution (${eligible.length} events)`);

  for (const event of eligible) {
    const marketKind = getMarketKind(event);
    let oracleResult: OracleResult;

    try {
      oracleResult = await resolveEvent(event);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Event ${event.id} oracle error: ${error}`);
      result.resolution.errors.push({ eventId: event.id, error });

      await safeAuditLog(event.id, "SENTINEL_RESOLVE_ERROR", {
        marketKind,
        error,
      });
      continue;
    }

    // Auto-resolve (L1, no review needed, outcome available)
    if (oracleResult.outcome && !oracleResult.needsReview) {
      const resolveResult = await triggerAutoResolve(event.id, oracleResult.outcome);

      if (resolveResult.ok) {
        result.resolution.autoResolved.push({
          eventId: event.id,
          outcome: oracleResult.outcome,
          level: oracleResult.level,
        });

        console.log(
          `  ✓ L${oracleResult.level} AUTO-RESOLVED: ${event.title.slice(0, 50)} → ${oracleResult.outcome}`
        );

        await safeAuditLog(event.id, "EVENT_RESOLVE", {
          source: `sentinel-oracle-L${oracleResult.level}`,
          outcome: oracleResult.outcome,
          marketKind,
          sources: oracleResult.sources,
          evidence: oracleResult.evidence,
        });
      } else {
        result.resolution.errors.push({
          eventId: event.id,
          error: resolveResult.error ?? "Unknown resolve error",
        });

        console.error(
          `  ✗ L${oracleResult.level} resolve failed for ${event.id}: ${resolveResult.error}`
        );

        await safeAuditLog(event.id, "SENTINEL_RESOLVE_ERROR", {
          source: `sentinel-oracle-L${oracleResult.level}`,
          outcome: oracleResult.outcome,
          error: resolveResult.error,
          marketKind,
        });
      }
      continue;
    }

    // Needs review (L2/L3, or L1 with disagreement)
    if (oracleResult.needsReview) {
      await prisma.event.update({
        where: { id: event.id },
        data: { resolutionStatus: "NEEDS_REVIEW" },
      });

      result.resolution.needsReview.push({
        eventId: event.id,
        reason: oracleResult.reason ?? "Oracle flagged for review",
        level: oracleResult.level,
        proposedOutcome: oracleResult.outcome,
      });

      console.log(
        `  ⚠ L${oracleResult.level} NEEDS_REVIEW: ${event.title.slice(0, 50)} — ${oracleResult.reason?.slice(0, 80)}`
      );

      await safeAuditLog(event.id, "SENTINEL_NEEDS_REVIEW", {
        source: `sentinel-oracle-L${oracleResult.level}`,
        proposedOutcome: oracleResult.outcome,
        reason: oracleResult.reason,
        marketKind,
        sources: oracleResult.sources,
        evidence: oracleResult.evidence,
      });
      continue;
    }

    // No outcome and no review flag — skip
    result.resolution.skipped.push({
      eventId: event.id,
      reason: oracleResult.reason ?? "No outcome determined",
    });

    console.log(
      `  — SKIPPED: ${event.title.slice(0, 50)} — ${oracleResult.reason ?? "unknown"}`
    );
  }

  result.durationMs = Date.now() - startTime;

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(
    `  SENTINEL COMPLETE in ${(result.durationMs / 1000).toFixed(1)}s`
  );
  console.log(
    `  Auto-resolved: ${result.resolution.autoResolved.length} | Needs review: ${result.resolution.needsReview.length} | Errors: ${result.resolution.errors.length}`
  );
  console.log("═══════════════════════════════════════════════════════════");

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function safeAuditLog(
  eventId: string,
  action: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await createAuditLog(prisma, {
      userId: null,
      action,
      entityType: "Event",
      entityId: eventId,
      payload,
    });
  } catch (err) {
    console.warn(
      `[SENTINEL] AuditLog write failed for ${eventId}:`,
      err instanceof Error ? err.message : err
    );
  }
}
