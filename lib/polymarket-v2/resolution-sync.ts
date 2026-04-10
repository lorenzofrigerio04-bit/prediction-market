import type { PrismaClient } from "@prisma/client";
import { resolveReplicaEventFromOfficialSource } from "@/lib/resolution/replica-auto-resolve";

type EventForResolution = {
  id: string;
  outcomes: unknown;
  marketType: string;
  creationMetadata: unknown;
};

async function getClosedUnresolvedPolymarketV2Events(prisma: PrismaClient): Promise<EventForResolution[]> {
  const now = new Date();
  const rows = await prisma.event.findMany({
    where: {
      closesAt: { lte: now },
      resolved: false,
      creationMetadata: {
        path: ["created_by_pipeline"],
        equals: "polymarket-v2",
      },
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

export async function runPolymarketV2ResolutionSync(params: {
  prisma: PrismaClient;
  baseUrl: string;
  cronSecret?: string;
}): Promise<{
  checked: number;
  autoResolved: Array<{ id: string; outcome: string }>;
  needsReview: Array<{ id: string; reason: string }>;
  errors: Array<{ id: string; error: string }>;
}> {
  const { prisma, baseUrl, cronSecret } = params;
  const events = await getClosedUnresolvedPolymarketV2Events(prisma);

  const autoResolved: Array<{ id: string; outcome: string }> = [];
  const needsReview: Array<{ id: string; reason: string }> = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const event of events) {
    const probe = await resolveReplicaEventFromOfficialSource(event);

    if ("outcome" in probe) {
      const res = await fetch(`${baseUrl}/api/admin/events/${event.id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
        },
        body: JSON.stringify({ outcome: probe.outcome, auto: true }),
      });

      if (res.ok) {
        autoResolved.push({ id: event.id, outcome: probe.outcome });
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

    if ("needsReview" in probe) {
      needsReview.push({ id: event.id, reason: probe.reason });
      await prisma.event.update({
        where: { id: event.id },
        data: { resolutionStatus: "NEEDS_REVIEW" },
      });
      continue;
    }

    errors.push({ id: event.id, error: probe.error });
    await prisma.event.update({
      where: { id: event.id },
      data: { resolutionStatus: "NEEDS_REVIEW" },
    });
  }

  return {
    checked: events.length,
    autoResolved,
    needsReview,
    errors,
  };
}

