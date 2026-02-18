/**
 * Pipeline V2 Debug Script
 * 
 * Esegue la pipeline V2 con logging dettagliato per debug.
 * Supporta dry-run e publish mode tramite flag --dry.
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { runPipelineV2 } from '../lib/pipeline/runPipelineV2';

async function main() {
  try {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry');

    console.log(`[Pipeline V2 Debug] Starting pipeline (mode: ${isDryRun ? 'DRY-RUN' : 'PUBLISH'})...\n`);

    const pipelineResult = await runPipelineV2({
      prisma,
      now: new Date(),
      dryRun: isDryRun,
    });

    // Output JSON counters
    const counters = {
      sourceArticlesCount: pipelineResult.debugInfo?.sourceArticlesCount ?? 0,
      sourceClustersCount: pipelineResult.debugInfo?.sourceClustersCount ?? 0,
      eligibleStorylinesCount: pipelineResult.eligibleStorylinesCount,
      candidatesGeneratedCount: pipelineResult.candidatesCount,
      verifiedCandidatesCount: pipelineResult.verifiedCandidatesCount,
      dedupedCandidatesCount: pipelineResult.dedupedCandidatesCount,
      selectedCount: pipelineResult.selectedCount,
      createdCount: pipelineResult.createdCount,
      skippedCount: pipelineResult.skippedCount,
      topRejectionReasons: pipelineResult.debugInfo?.topRejectionReasons ?? {},
      sampleEligibleStorylines: pipelineResult.debugInfo?.sampleEligibleStorylines ?? [],
      sampleCandidates: pipelineResult.debugInfo?.sampleCandidates ?? [],
    };

    console.log('\n[Pipeline V2 Debug] Results (JSON):');
    console.log(JSON.stringify(counters, null, 2));

    // Summary
    console.log('\n[Pipeline V2 Debug] Summary:');
    console.log(`  Source Articles: ${counters.sourceArticlesCount}`);
    console.log(`  Source Clusters: ${counters.sourceClustersCount}`);
    console.log(`  Eligible Storylines: ${counters.eligibleStorylinesCount}`);
    console.log(`  Candidates Generated: ${counters.candidatesGeneratedCount}`);
    console.log(`  Candidates Verified: ${counters.verifiedCandidatesCount}`);
    console.log(`  Candidates Deduped: ${counters.dedupedCandidatesCount}`);
    console.log(`  Candidates Selected: ${counters.selectedCount}`);
    console.log(`  Events Created: ${counters.createdCount}`);
    console.log(`  Events Skipped: ${counters.skippedCount}`);

    if (Object.keys(counters.topRejectionReasons).length > 0) {
      console.log('\n  Top Rejection Reasons:');
      for (const [reason, count] of Object.entries(counters.topRejectionReasons)) {
        console.log(`    ${reason}: ${count}`);
      }
    }

    if (counters.sampleEligibleStorylines.length > 0) {
      console.log('\n  Sample Eligible Storylines:');
      counters.sampleEligibleStorylines.forEach((s, i) => {
        console.log(
          `    ${i + 1}. ID: ${s.id}, Signals: ${s.signalsCount}, ` +
          `Authority: ${s.authorityType}, Momentum: ${s.momentum.toFixed(1)}, Novelty: ${s.novelty.toFixed(1)}`
        );
      });
    }

    if (counters.sampleCandidates.length > 0) {
      console.log('\n  Sample Candidates:');
      counters.sampleCandidates.forEach((c, i) => {
        console.log(
          `    ${i + 1}. [${c.category}] ${c.title.slice(0, 60)}... ` +
          `Score: ${c.score.toFixed(2)}, Host: ${c.authorityHost}`
        );
      });
    }

    // Exit code: 0 created = warning, non crash
    if (isDryRun) {
      console.log('\n[Pipeline V2 Debug] ✓ Dry-run completed');
      process.exit(0);
    } else {
      if (pipelineResult.createdCount > 0) {
        console.log('\n[Pipeline V2 Debug] ✓ Pipeline completed successfully');
      } else {
        console.log('\n[Pipeline V2 Debug] ⚠ No events created (check rejection reasons above)');
      }
      process.exit(0);
    }
  } catch (error) {
    console.error('[Pipeline V2 Debug] Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
