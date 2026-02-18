/**
 * Backfill dedupKey per Event con dedupKey null/empty.
 * Usa computeDedupKey (stessa logica di publish). Salta con MISSING_FIELDS se mancano campi.
 *
 * Usage: pnpm db:backfill-dedupkeys
 */

import 'dotenv/config';
import { createHash } from 'crypto';
import { prisma } from '../lib/prisma';
import { computeDedupKey, normalizeTitle } from '../lib/event-publishing/dedup';

/** Per eventi senza resolutionAuthorityHost: chiave univoca legacy (stesso formato hash, host placeholder + id) */
function legacyDedupKey(title: string, closesAt: Date, eventId: string): string {
  const normalizedTitle = normalizeTitle(title);
  const dateStr = closesAt.toISOString().split('T')[0];
  const combined = `${normalizedTitle}|${dateStr}|legacy.backfill|${eventId}`;
  return createHash('sha256').update(combined).digest('hex');
}

async function main() {
  const events = await prisma.event.findMany({
    where: {
      OR: [{ dedupKey: null }, { dedupKey: '' }],
    },
    select: {
      id: true,
      title: true,
      closesAt: true,
      resolutionAuthorityHost: true,
    },
  });

  let updatedCount = 0;
  let skippedCount = 0;
  const reasonsCount: Record<string, number> = {};

  for (const event of events) {
    const hasTitle = event.title != null && String(event.title).trim() !== '';
    const hasClosesAt = event.closesAt != null;
    const hasHost =
      event.resolutionAuthorityHost != null &&
      String(event.resolutionAuthorityHost).trim() !== '';

    if (!hasTitle || !hasClosesAt) {
      skippedCount++;
      reasonsCount['MISSING_FIELDS'] = (reasonsCount['MISSING_FIELDS'] ?? 0) + 1;
      console.warn(
        `Skip ${event.id}: MISSING_FIELDS (title=${!!hasTitle} closesAt=${!!hasClosesAt})`
      );
      continue;
    }

    let baseKey: string;
    if (hasHost) {
      try {
        baseKey = computeDedupKey({
          title: event.title!,
          closesAt: event.closesAt!,
          resolutionAuthorityHost: event.resolutionAuthorityHost!,
        });
      } catch (e) {
        skippedCount++;
        reasonsCount['MISSING_FIELDS'] = (reasonsCount['MISSING_FIELDS'] ?? 0) + 1;
        console.warn(`Skip ${event.id}: ${(e as Error).message}`);
        continue;
      }
    } else {
      // Host mancante: usa chiave legacy univoca (backfill only)
      baseKey = legacyDedupKey(event.title!, event.closesAt!, event.id);
      reasonsCount['LEGACY_BACKFILL'] = (reasonsCount['LEGACY_BACKFILL'] ?? 0) + 1;
    }

    // Se un altro evento ha già questo dedupKey, usa suffix deterministico |eventId
    const existing = await prisma.event.findFirst({
      where: { dedupKey: baseKey, id: { not: event.id } },
      select: { id: true },
    });
    const dedupKey = existing ? `${baseKey}|${event.id}` : baseKey;
    if (existing) {
      reasonsCount['DEDUP_KEY_SUFFIXED'] = (reasonsCount['DEDUP_KEY_SUFFIXED'] ?? 0) + 1;
    }

    await prisma.event.update({
      where: { id: event.id },
      data: { dedupKey },
    });
    updatedCount++;
  }

  console.log('=== Backfill dedupKey Summary ===');
  console.log('updatedCount:', updatedCount);
  console.log('skippedCount:', skippedCount);
  console.log('reasonsCount:', reasonsCount);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
