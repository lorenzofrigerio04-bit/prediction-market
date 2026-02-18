/**
 * Pipeline V2 End-to-End Script
 * 
 * Esegue l'intera pipeline V2:
 * 1. Ingestion (chiama la stessa funzione di scripts/ingest.ts)
 * 2. runPipelineV2 (generazione eventi + publish BLOCCO 5)
 * 
 * Stampa JSON counters con tutte le metriche.
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { processAllSources, aggregateStats } from '../lib/ingestion/processing/pipeline';
import { runPipelineV2 } from '../lib/pipeline/runPipelineV2';

async function main() {
  try {
    console.log('[Pipeline V2] Starting end-to-end pipeline...\n');

    // Step 1: Ingestion
    console.log('[Pipeline V2] Step 1: Running ingestion...');
    const ingestionResults = await processAllSources();
    const ingestionStats = aggregateStats(ingestionResults);
    
    const sourceArticlesCount = ingestionStats.articlesNew;
    const sourceClustersCount = ingestionStats.clustersCreated;

    console.log(`  ✓ Ingestion complete: ${sourceArticlesCount} articles, ${sourceClustersCount} clusters\n`);

    // Step 2: Pipeline V2 (generazione eventi + publish)
    console.log('[Pipeline V2] Step 2: Running event generation pipeline...');
    const pipelineResult = await runPipelineV2({
      prisma,
      now: new Date(),
      dryRun: false,
    });

    // Output JSON counters
    const counters = {
      sourceArticlesCount,
      sourceClustersCount,
      eligibleStorylinesCount: pipelineResult.eligibleStorylinesCount,
      candidatesGeneratedCount: pipelineResult.candidatesCount,
      verifiedCandidatesCount: pipelineResult.verifiedCandidatesCount,
      selectedCount: pipelineResult.selectedCount,
      createdCount: pipelineResult.createdCount,
      skippedCount: pipelineResult.skippedCount,
      topRejectionReasons: Object.entries(pipelineResult.reasonsCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, number>),
    };

    console.log('\n[Pipeline V2] Results (JSON):');
    console.log(JSON.stringify(counters, null, 2));

    // Summary
    console.log('\n[Pipeline V2] Summary:');
    console.log(`  Source Articles: ${sourceArticlesCount}`);
    console.log(`  Source Clusters: ${sourceClustersCount}`);
    console.log(`  Eligible Storylines: ${pipelineResult.eligibleStorylinesCount}`);
    console.log(`  Candidates Generated: ${pipelineResult.candidatesCount}`);
    console.log(`  Candidates Verified: ${pipelineResult.verifiedCandidatesCount}`);
    console.log(`  Candidates Selected: ${pipelineResult.selectedCount}`);
    console.log(`  Events Created: ${pipelineResult.createdCount}`);
    console.log(`  Events Skipped: ${pipelineResult.skippedCount}`);

    if (Object.keys(counters.topRejectionReasons).length > 0) {
      console.log('\n  Top Rejection Reasons:');
      for (const [reason, count] of Object.entries(counters.topRejectionReasons)) {
        console.log(`    ${reason}: ${count}`);
      }
    }

    if (pipelineResult.createdCount > 0) {
      console.log('\n[Pipeline V2] ✓ Pipeline completed successfully');
      process.exit(0);
    } else {
      console.log('\n[Pipeline V2] ⚠ No events created (check rejection reasons above)');
      process.exit(1);
    }
  } catch (error) {
    console.error('[Pipeline V2] Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
