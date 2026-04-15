/**
 * SENTINEL Live Monitor — updates match status for open sport events.
 *
 * Called by the resolution cron before Oracle resolution.
 * Queries API-Football for live matches and updates Event.matchStatus in the DB.
 * This is a lightweight status updater, NOT a polling daemon.
 */

import { prisma } from "@/lib/prisma";
import { fetchFixtures, type ApiFixture } from "../radar/clients/api-football";
import { normalizeFixture } from "../radar/normalizers";

// ---------------------------------------------------------------------------
// Status mapping: API-Football short codes → DB matchStatus
// ---------------------------------------------------------------------------

const STATUS_SHORT_TO_DB: Record<string, string> = {
  NS: "NOT_STARTED",
  "1H": "IN_PLAY",
  HT: "HALFTIME",
  "2H": "IN_PLAY",
  ET: "EXTRA_TIME",
  BT: "HALFTIME",
  P: "PENALTY",
  SUSP: "SUSPENDED",
  INT: "PAUSED",
  FT: "FINISHED",
  AET: "FINISHED",
  PEN: "FINISHED",
  PST: "POSTPONED",
  CANC: "CANCELLED",
  ABD: "CANCELLED",
  AWD: "FINISHED",
  WO: "FINISHED",
  LIVE: "IN_PLAY",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LiveMonitorResult {
  checkedEvents: number;
  updatedEvents: number;
  transitions: Array<{
    eventId: string;
    title: string;
    oldStatus: string | null;
    newStatus: string;
  }>;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

/**
 * Check all live matches and update match status for relevant sport events.
 * Returns a summary of which events were updated.
 */
export async function checkLiveMatches(): Promise<LiveMonitorResult> {
  const result: LiveMonitorResult = {
    checkedEvents: 0,
    updatedEvents: 0,
    transitions: [],
    errors: [],
  };

  try {
    // Fetch all currently live fixtures from API-Football
    const liveFixtures = await fetchFixtures({ live: "all" });

    if (!liveFixtures || liveFixtures.length === 0) {
      console.log("[SENTINEL/live-monitor] No live fixtures found");
      return result;
    }

    console.log(`[SENTINEL/live-monitor] Found ${liveFixtures.length} live fixtures`);

    // Build a map of API-Football match IDs to fixture data
    const fixtureMap = new Map<number, ApiFixture>();
    for (const f of liveFixtures) {
      fixtureMap.set(f.fixture.id, f);
    }

    // Find open sport events that might relate to these live matches
    const openSportEvents = await prisma.event.findMany({
      where: {
        sourceType: "SPORT",
        resolved: false,
        status: "OPEN",
      },
      select: {
        id: true,
        title: true,
        matchStatus: true,
        creationMetadata: true,
        footballDataMatchId: true,
      },
    });

    result.checkedEvents = openSportEvents.length;

    for (const event of openSportEvents) {
      try {
        const meta = event.creationMetadata as Record<string, unknown> | null;
        const apiFootballId = extractApiFootballId(event, meta);

        if (!apiFootballId) continue;

        const fixture = fixtureMap.get(apiFootballId);
        if (!fixture) continue;

        const newStatus = STATUS_SHORT_TO_DB[fixture.fixture.status.short];
        if (!newStatus) continue;

        if (event.matchStatus !== newStatus) {
          await prisma.event.update({
            where: { id: event.id },
            data: { matchStatus: newStatus },
          });

          result.updatedEvents++;
          result.transitions.push({
            eventId: event.id,
            title: event.title,
            oldStatus: event.matchStatus,
            newStatus,
          });

          console.log(
            `[SENTINEL/live-monitor] ${event.title.slice(0, 50)}: ${event.matchStatus ?? "null"} → ${newStatus}`
          );
        }
      } catch (err) {
        result.errors.push(
          `Event ${event.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[SENTINEL/live-monitor] Fatal error:", msg);
    result.errors.push(`Fatal: ${msg}`);
  }

  return result;
}

/**
 * Update match status for finished matches that we missed during live monitoring.
 * Checks events where matchStatus is still IN_PLAY/HALFTIME but closesAt has passed.
 */
export async function syncFinishedMatches(): Promise<LiveMonitorResult> {
  const result: LiveMonitorResult = {
    checkedEvents: 0,
    updatedEvents: 0,
    transitions: [],
    errors: [],
  };

  const staleEvents = await prisma.event.findMany({
    where: {
      sourceType: "SPORT",
      resolved: false,
      matchStatus: { in: ["IN_PLAY", "HALFTIME", "PAUSED", "EXTRA_TIME", "PENALTY"] },
      closesAt: { lte: new Date() },
    },
    select: {
      id: true,
      title: true,
      matchStatus: true,
      creationMetadata: true,
      footballDataMatchId: true,
    },
  });

  result.checkedEvents = staleEvents.length;

  for (const event of staleEvents) {
    try {
      const meta = event.creationMetadata as Record<string, unknown> | null;
      const apiFootballId = extractApiFootballId(event, meta);

      if (!apiFootballId) continue;

      const fixtures = await fetchFixtures({ id: apiFootballId });
      if (!fixtures || fixtures.length === 0) continue;

      const newStatus = STATUS_SHORT_TO_DB[fixtures[0].fixture.status.short];
      if (!newStatus || newStatus === event.matchStatus) continue;

      await prisma.event.update({
        where: { id: event.id },
        data: { matchStatus: newStatus },
      });

      result.updatedEvents++;
      result.transitions.push({
        eventId: event.id,
        title: event.title,
        oldStatus: event.matchStatus,
        newStatus,
      });
    } catch (err) {
      result.errors.push(
        `Event ${event.id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractApiFootballId(
  event: { creationMetadata: unknown },
  meta: Record<string, unknown> | null
): number | null {
  if (meta && typeof meta.api_football_match_id === "number") {
    return meta.api_football_match_id;
  }

  // Try extracting from source_storyline_id: "fie:<id>:<slug>"
  if (meta && typeof meta.source_storyline_id === "string") {
    const parts = (meta.source_storyline_id as string).split(":");
    if (parts[0] === "fie" && parts[1]) {
      const id = parseInt(parts[1], 10);
      if (!isNaN(id)) return id;
    }
  }

  return null;
}
