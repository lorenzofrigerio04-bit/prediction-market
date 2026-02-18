/**
 * Audit script per dedupKey su Event
 * dedupKey è required (NOT NULL). Controlla empty e malformed.
 *
 * Usage: pnpm db:dedup-audit
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

const HEX64 = /^[0-9a-fA-F]{64}$/;

function isValidDedupKey(key: string): boolean {
  return key.length === 64 && HEX64.test(key);
}

function isMalformedDedupKey(key: string): boolean {
  if (key === '') return false; // empty, not malformed
  return key.length !== 64 || !HEX64.test(key);
}

async function main() {
  const [total, open, emptyCount, allEvents] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: 'OPEN' } }),
    prisma.event.count({ where: { dedupKey: '' } }),
    prisma.event.findMany({
      select: {
        id: true,
        title: true,
        closesAt: true,
        resolutionAuthorityHost: true,
        status: true,
        dedupKey: true,
      },
    }),
  ]);

  const malformedCount = allEvents.filter((e) => isMalformedDedupKey(e.dedupKey)).length;
  const emptyOrMalformed = allEvents.filter(
    (e) => e.dedupKey === '' || isMalformedDedupKey(e.dedupKey)
  );
  const valid = allEvents.filter((e) => e.dedupKey !== '' && isValidDedupKey(e.dedupKey));

  console.log('=== DB Dedup Audit ===\n');
  console.log('Total events:', total);
  console.log('Open events:', open);
  console.log('dedupKey empty count:', emptyCount);
  console.log('dedupKey malformed count (length != 64 or non-hex):', malformedCount);
  console.log('\n--- Sample 10 eventi con dedupKey empty/malformed ---');
  emptyOrMalformed.slice(0, 10).forEach((e, i) => {
    console.log(
      `${i + 1}. id=${e.id} title="${(e.title || '').slice(0, 50)}..." closesAt=${e.closesAt?.toISOString?.() ?? 'n/a'} authorityHost=${e.resolutionAuthorityHost ?? 'null'} status=${e.status} dedupKey=${(e.dedupKey || '').slice(0, 24)}${e.dedupKey && e.dedupKey.length > 24 ? '...' : ''} (len=${e.dedupKey?.length ?? 0})`
    );
  });
  console.log('\n--- Sample 5 eventi con dedupKey valid ---');
  valid.slice(0, 5).forEach((e, i) => {
    console.log(`${i + 1}. id=${e.id} dedupKey=${e.dedupKey.slice(0, 24)}...`);
  });
}

function isConnectionError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /connect|ECONNREFUSED|P1001|P1017|timeout/i.test(msg);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Audit error:', e instanceof Error ? e.message : e);
    if (e instanceof Error && e.stack) console.error(e.stack);
    process.exit(isConnectionError(e) ? 1 : 0);
  })
  .finally(() => prisma.$disconnect());
