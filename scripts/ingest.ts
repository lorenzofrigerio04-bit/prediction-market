/**
 * Local ingestion script
 * 
 * Runs the ingestion pipeline locally without HTTP endpoint.
 * Prints counts: fetched, inserted, deduped, clustersCreated/updated
 */

import 'dotenv/config';
import { processAllSources, aggregateStats } from '../lib/ingestion/processing/pipeline';

async function main() {
  try {
    console.log('[Ingest] Starting ingestion pipeline...\n');

    const results = await processAllSources();
    const aggregated = aggregateStats(results);

    console.log('\n[Ingest] Results:');
    console.log(`  Articles fetched: ${aggregated.articlesFetched}`);
    console.log(`  Articles new: ${aggregated.articlesNew}`);
    console.log(`  Articles deduped: ${aggregated.articlesDeduped}`);
    console.log(`  Clusters created: ${aggregated.clustersCreated}`);
    console.log(`  Success count: ${aggregated.successCount}/${results.length}`);
    console.log(`  Total duration: ${aggregated.totalDurationMs}ms\n`);

    // Print per-source breakdown
    console.log('[Ingest] Per-source breakdown:');
    const sourceTypes = ['NEWSAPI', 'RSS_MEDIA', 'RSS_OFFICIAL', 'CALENDAR_SPORT', 'CALENDAR_EARNINGS'];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const sourceType = sourceTypes[i] || 'UNKNOWN';
      const status = result.success ? '✓' : '✗';
      console.log(
        `  ${status} ${sourceType}: ` +
        `fetched=${result.stats.articlesFetched} ` +
        `new=${result.stats.articlesNew} ` +
        `deduped=${result.stats.articlesDeduped} ` +
        `clusters=${result.stats.clustersCreated} ` +
        `(${result.durationMs}ms)`
      );
      if (!result.success && result.errorMessage) {
        console.log(`    Error: ${result.errorMessage}`);
      }
    }

    if (aggregated.successCount === results.length) {
      console.log('\n[Ingest] ✓ All sources processed successfully');
      process.exit(0);
    } else {
      console.log(`\n[Ingest] ⚠ Some sources failed (${aggregated.successCount}/${results.length} succeeded)`);
      process.exit(1);
    }
  } catch (error) {
    console.error('[Ingest] Fatal error:', error);
    process.exit(1);
  }
}

main();
