import type { PrismaClient } from "@prisma/client";
import { getValidOutcomeKeys, parseOutcomesJson } from "@/lib/market-types";
import { fetchJsonWithRetry } from "@/lib/event-replica/fetch-json";
import {
  buildKalshiAuthHeaders,
  getKalshiAccessKeyId,
  loadKalshiPrivateKeyPem,
} from "@/lib/kalshi-auth";

type ReplicaClosedEvent = {
  id: string;
  outcomes: unknown;
  marketType: string;
  creationMetadata: unknown;
};

type ResolutionProbeResult =
  | { outcome: string }
  | { needsReview: true; reason: string }
  | { error: string };

function getMetadataRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return input as Record<string, unknown>;
}

function toString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function getGroupChildrenFromMetadata(metadata: Record<string, unknown>): Array<{
  externalId: string;
  outcomeKey: string;
  outcomeLabel: string;
}> {
  const raw = metadata.polymarket_v2_group_children;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
      const record = entry as Record<string, unknown>;
      const externalId = toString(record.externalId);
      const outcomeKey = toString(record.outcomeKey);
      const outcomeLabel = toString(record.outcomeLabel);
      if (!externalId || !outcomeKey || !outcomeLabel) return null;
      return { externalId, outcomeKey, outcomeLabel };
    })
    .filter((entry): entry is { externalId: string; outcomeKey: string; outcomeLabel: string } => Boolean(entry));
}

function mapOutcomeAgainstEvent(outcome: string, event: ReplicaClosedEvent): string | null {
  const normalized = outcome.trim();
  if (event.marketType === "BINARY") {
    if (normalized.toUpperCase() === "YES" || normalized.toUpperCase() === "NO") {
      return normalized.toUpperCase();
    }
    return null;
  }

  const validKeys = getValidOutcomeKeys(event.outcomes);
  if (validKeys.includes(normalized)) return normalized;

  const options = parseOutcomesJson(event.outcomes) ?? [];
  const byLabel = options.find((opt) => opt.label.toLowerCase() === normalized.toLowerCase());
  return byLabel?.key ?? null;
}

async function probePolymarketOutcome(externalId: string): Promise<ResolutionProbeResult> {
  const endpointTemplate =
    process.env.POLYMARKET_MARKET_BY_ID_URL_TEMPLATE?.trim() ??
    "https://gamma-api.polymarket.com/markets/{id}";
  const endpoint = endpointTemplate.replace("{id}", encodeURIComponent(externalId));

  try {
    const payload = await fetchJsonWithRetry<Record<string, unknown>>(endpoint, {
      timeoutMs: 15_000,
      retryCount: 2,
    });
    const winner =
      toString(payload.winning_outcome) ??
      toString(payload.winner) ??
      toString(payload.resolution) ??
      toString(payload.result);

    if (!winner) {
      return { needsReview: true, reason: "missing_polymarket_winner" };
    }
    return { outcome: winner };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

async function probeKalshiOutcome(externalId: string): Promise<ResolutionProbeResult> {
  const endpointTemplate =
    process.env.KALSHI_MARKET_BY_ID_URL_TEMPLATE?.trim() ??
    "https://trading-api.kalshi.com/trade-api/v2/markets/{id}";
  const endpoint = endpointTemplate.replace("{id}", encodeURIComponent(externalId));
  const keyId = getKalshiAccessKeyId();
  const privatePem = loadKalshiPrivateKeyPem();
  const legacyBearer = process.env.KALSHI_API_KEY?.trim();

  try {
    const payload = await fetchJsonWithRetry<Record<string, unknown>>(endpoint, {
      timeoutMs: 15_000,
      retryCount: 2,
      ...(keyId && privatePem
        ? {
            getHeaders: () => buildKalshiAuthHeaders("GET", endpoint, privatePem, keyId),
          }
        : legacyBearer
          ? { headers: { Authorization: `Bearer ${legacyBearer}` } }
          : {}),
    });
    const status = toString(payload.status)?.toLowerCase();
    if (status && status !== "settled") {
      return { needsReview: true, reason: "kalshi_market_not_settled_yet" };
    }
    const winner =
      toString(payload.result) ??
      toString(payload.settlement_value) ??
      toString(payload.winner) ??
      toString(payload.final_outcome);

    if (!winner) {
      return { needsReview: true, reason: "missing_kalshi_winner" };
    }
    return { outcome: winner };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getClosedUnresolvedReplicaEvents(
  prisma: PrismaClient
): Promise<ReplicaClosedEvent[]> {
  const now = new Date();
  const rows = await prisma.event.findMany({
    where: {
      closesAt: { lte: now },
      resolved: false,
      OR: [
        {
          creationMetadata: {
            path: ["created_by_pipeline"],
            equals: "event-replica",
          },
        },
        {
          creationMetadata: {
            path: ["created_by_pipeline"],
            equals: "polymarket-v2",
          },
        },
      ],
    },
    select: {
      id: true,
      outcomes: true,
      marketType: true,
      creationMetadata: true,
    },
    orderBy: { closesAt: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    outcomes: row.outcomes,
    marketType: row.marketType ?? "BINARY",
    creationMetadata: row.creationMetadata,
  }));
}

export async function resolveReplicaEventFromOfficialSource(
  event: ReplicaClosedEvent
): Promise<ResolutionProbeResult> {
  const metadata = getMetadataRecord(event.creationMetadata);
  const groupedChildren = getGroupChildrenFromMetadata(metadata);
  if (groupedChildren.length > 0) {
    const winners: string[] = [];
    for (const child of groupedChildren) {
      const probe = await probePolymarketOutcome(child.externalId);
      if (!("outcome" in probe)) continue;
      const normalized = probe.outcome.trim().toUpperCase();
      if (normalized === "YES" || normalized === "TRUE" || normalized === "1") {
        winners.push(child.outcomeKey);
      }
    }
    if (winners.length === 1) {
      return { outcome: winners[0] };
    }
    if (winners.length > 1) {
      return { needsReview: true, reason: "multiple_group_winners_detected" };
    }
    return { needsReview: true, reason: "missing_group_winner" };
  }

  const sourcePlatform = toString(metadata.replica_source_platform);
  const externalId = toString(metadata.replica_external_id);
  if (!sourcePlatform || !externalId) {
    return { needsReview: true, reason: "missing_replica_metadata" };
  }

  const probe =
    sourcePlatform === "polymarket"
      ? await probePolymarketOutcome(externalId)
      : sourcePlatform === "kalshi"
        ? await probeKalshiOutcome(externalId)
        : { needsReview: true as const, reason: "unknown_source_platform" };

  if (!("outcome" in probe)) return probe;
  const mapped = mapOutcomeAgainstEvent(probe.outcome, event);
  if (!mapped) {
    return { needsReview: true, reason: "outcome_not_mappable_to_event" };
  }
  return { outcome: mapped };
}
