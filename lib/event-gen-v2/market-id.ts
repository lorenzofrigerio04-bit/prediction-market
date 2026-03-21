/**
 * Generate unique market ID in format PM-YYYY-NNNNN (rulebook requirement)
 */

import type { PrismaClient } from '@prisma/client';

/** Transaction client or full Prisma client (solo `event` è usato). */
type PrismaForMarketId = Pick<PrismaClient, "event">;

/**
 * Generates a market ID in format PM-YYYY-NNNNN
 * @param year - 4-digit year (e.g. 2025)
 * @param seq - 1-based sequence number (padded to 5 digits)
 */
export function generateMarketId(year: number, seq: number): string {
  const yearStr = String(year);
  if (yearStr.length !== 4) {
    throw new Error(`Invalid year for marketId: ${year}`);
  }
  const seqStr = String(seq).padStart(5, '0');
  if (seqStr.length > 5) {
    throw new Error(`Sequence too large for marketId: ${seq}`);
  }
  return `PM-${yearStr}-${seqStr}`;
}

/**
 * Gets the next market ID for the given year by querying existing marketIds
 */
export async function getNextMarketId(prisma: PrismaForMarketId, year: number): Promise<string> {
  const prefix = `PM-${year}-`;
  const existing = await prisma.event.findMany({
    where: {
      marketId: { startsWith: prefix },
    },
    select: { marketId: true },
  });

  let maxSeq = 0;
  for (const e of existing) {
    if (e.marketId) {
      const suffix = e.marketId.slice(prefix.length);
      const seq = parseInt(suffix, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  return generateMarketId(year, maxSeq + 1);
}
