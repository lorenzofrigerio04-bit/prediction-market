/**
 * Audit end-to-end della pipeline V2 (dry-run, nessun evento scritto).
 * Stampa DB, Storylines, Candidates, Dedup+Selection e sample per capire perché 0 created.
 *
 * Usage: pnpm pipeline:audit
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { runPipelineV2 } from '../lib/pipeline/runPipelineV2';

const TARGET_DEFAULT = parseInt(process.env.TARGET_OPEN_EVENTS || '40', 10) || 40;
const AUDIT_TIMEOUT_MS = 30_000;

let timeoutId: ReturnType<typeof setTimeout> | null = null;

async function main(): Promise<void> {
  console.log('[Pipeline Audit] start');

  timeoutId = setTimeout(() => {
    console.error('[Pipeline Audit] Audit timeout');
    prisma.$disconnect().then(() => process.exit(1));
  }, AUDIT_TIMEOUT_MS);

  const now = new Date();

  const [sourceArticleCount, sourceClusterCount, openEventCount] = await Promise.all([
    prisma.sourceArticle.count(),
    prisma.sourceCluster.count(),
    prisma.event.count({
      where: { status: 'OPEN', closesAt: { gt: now } },
    }),
  ]);

  const target = TARGET_DEFAULT;
  const need = Math.max(0, target - openEventCount);

  console.log('\n[DB]');
  console.log('  SourceArticle count:', sourceArticleCount);
  console.log('  SourceCluster count:', sourceClusterCount);
  console.log('  Event OPEN count (closesAt > now):', openEventCount);
  console.log('  TARGET_OPEN_EVENTS:', target);
  console.log('  need = max(0, target - open):', need);

  const result = await runPipelineV2({
    prisma,
    now,
    dryRun: true,
  });

  const d = result.debugInfo;
  if (!d) {
    console.log('\n[Pipeline] No debugInfo returned');
    console.log('[Pipeline Audit] done');
    return;
  }

  console.log('\n[Storylines]');
  console.log('  clustersLoadedCount:', d.clustersLoadedCount ?? 'n/a');
  console.log('  clustersAfterLookbackCount:', d.clustersAfterLookbackCount ?? 'n/a');
  console.log('  storylinesEligibleCount:', d.eligibleStorylinesCount);
  console.log('  top 5 exclusion reasons:', d.storylineExclusionReasons ?? {});
  console.log('  sample 5 eligible:');
  (d.sampleEligibleStorylines ?? []).slice(0, 5).forEach((s, i) => {
    console.log(
      `    ${i + 1}. id=${s.id} signalsCount=${s.signalsCount} authorityType=${s.authorityType} authorityHost=${s.authorityHost} momentum=${s.momentum?.toFixed(1)} novelty=${s.novelty?.toFixed(1)}`
    );
  });

  console.log('\n[Candidates]');
  console.log('  candidatesGeneratedCount:', d.candidatesGeneratedCount);
  console.log('  candidatesVerifiedCount:', d.verifiedCandidatesCount);
  const rejected = Object.values(d.candidateRejectionReasons ?? {}).reduce((a, b) => a + b, 0);
  console.log('  candidatesRejectedCount (verifier):', rejected);
  console.log('  top rejection reasons (verifier):', d.candidateRejectionReasons ?? {});
  console.log('  distribution templateId (top 10):', d.templateIdDistribution ?? {});
  console.log('  distribution category:', d.categoryDistribution ?? {});

  console.log('\n[Dedup+Selection]');
  console.log('  duplicatesInDBCount:', d.duplicatesInDBCount ?? 'n/a');
  console.log('  duplicatesInRunCount:', d.duplicatesInRunCount ?? 'n/a');
  console.log('  dedupedCandidatesCount:', d.dedupedCandidatesCount);
  console.log('  selectedCount:', d.selectedCount);
  if (d.selectedCount === 0) {
    console.log('  >>> selectedCount=0 reason:', d.zeroSelectedReason ?? 'unknown');
    console.log('  >>> need==0?', d.need === 0);
    console.log('  >>> candidates==0?', (d.candidatesGeneratedCount ?? 0) === 0);
    console.log('  >>> all deduped?', (d.dedupedCandidatesCount ?? 0) === 0 && (d.candidatesGeneratedCount ?? 0) > 0);
  }

  console.log('\n[Sample 10 best candidates]');
  (d.sampleCandidates ?? []).slice(0, 10).forEach((c, i) => {
    console.log(
      `  ${i + 1}. title="${(c.title ?? '').slice(0, 55)}..." score=${c.score} closesAt=${c.closesAt} authorityHost=${c.authorityHost} templateId=${c.templateId} storylineId=${c.storylineId} dedupKey=${(c.dedupKey ?? '').slice(0, 16)}...`
    );
  });

  console.log('[Pipeline Audit] done');
}

main()
  .finally(() => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    return prisma.$disconnect().catch(() => {});
  })
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error('[Pipeline Audit] Pipeline audit error:', e);
    process.exit(1);
  });
