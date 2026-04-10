import type { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { ReplicaCandidate } from "@/lib/event-replica/types";

type ExistingEventRow = {
  id: string;
  title: string;
  description: string | null;
  closesAt: Date;
  marketType: string;
  outcomes: unknown;
  resolved: boolean;
  creationMetadata: unknown;
};

function readMetadataString(input: unknown, key: string): string | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = (input as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function loadExistingEventsByExternalId(
  prisma: PrismaClient,
  externalIds: string[]
): Promise<Map<string, ExistingEventRow>> {
  if (externalIds.length === 0) return new Map();

  const orConditions = externalIds.flatMap((externalId) => [
    {
      creationMetadata: {
        path: ["polymarket_v2_external_id"],
        equals: externalId,
      },
    },
    {
      creationMetadata: {
        path: ["replica_external_id"],
        equals: externalId,
      },
    },
  ]);

  const rows = await prisma.event.findMany({
    where: {
      OR: orConditions,
    },
    select: {
      id: true,
      title: true,
      description: true,
      closesAt: true,
      marketType: true,
      outcomes: true,
      resolved: true,
      creationMetadata: true,
    },
  });

  const byExternalId = new Map<string, ExistingEventRow>();
  for (const row of rows) {
    const v2ExternalId = readMetadataString(row.creationMetadata, "polymarket_v2_external_id");
    const replicaExternalId = readMetadataString(row.creationMetadata, "replica_external_id");
    const resolvedExternalId = v2ExternalId ?? replicaExternalId;
    if (!resolvedExternalId) continue;
    if (!byExternalId.has(resolvedExternalId)) {
      byExternalId.set(resolvedExternalId, row);
    }
  }

  return byExternalId;
}

export async function syncExistingPolymarketV2Events(
  prisma: PrismaClient,
  candidates: ReplicaCandidate[],
  now: Date,
  dryRun: boolean
): Promise<{ updatedCount: number; updatedIds: string[]; updatedExternalIds: string[] }> {
  let updatedCount = 0;
  const updatedIds: string[] = [];
  const updatedExternalIds: string[] = [];
  const externalIds = Array.from(
    new Set(
      candidates
        .map((candidate) => String(candidate.creationMetadata?.polymarket_v2_external_id ?? "").trim())
        .filter(Boolean)
    )
  );
  const existingByExternalId = await loadExistingEventsByExternalId(prisma, externalIds);

  for (const candidate of candidates) {
    const externalId = String(candidate.creationMetadata?.polymarket_v2_external_id ?? "").trim();
    if (!externalId) continue;
    const existing = existingByExternalId.get(externalId);
    if (!existing || existing.resolved) continue;

    if (!dryRun) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          title: candidate.title,
          description: candidate.description,
          closesAt: candidate.closesAt,
          marketType: candidate.marketType ?? existing.marketType,
          outcomes: (candidate.outcomes ?? existing.outcomes) as Prisma.InputJsonValue,
          creationMetadata: {
            ...(existing.creationMetadata as Record<string, unknown> | null),
            ...(candidate.creationMetadata ?? {}),
            polymarket_v2_last_sync_at: now.toISOString(),
            polymarket_v2_sync_status: "SYNCED",
          } as Prisma.InputJsonValue,
        },
      });
    }

    updatedCount += 1;
    updatedIds.push(existing.id);
    updatedExternalIds.push(externalId);
  }

  return { updatedCount, updatedIds, updatedExternalIds };
}

