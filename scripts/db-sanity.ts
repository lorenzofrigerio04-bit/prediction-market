/**
 * Database Sanity Check Script
 * 
 * Stampa conteggi chiave per verificare lo stato del database:
 * - SourceArticle count
 * - SourceCluster count
 * - Event OPEN count
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  try {
    console.log('[DB Sanity] Checking database state...\n');

    const [sourceArticlesCount, sourceClustersCount, openEventsCount] = await Promise.all([
      prisma.sourceArticle.count(),
      prisma.sourceCluster.count(),
      prisma.event.count({
        where: {
          status: 'OPEN',
        },
      }),
    ]);

    // Count SourceClusters with articles (join)
    const clustersWithArticles = await prisma.sourceCluster.count({
      where: {
        articles: {
          some: {},
        },
      },
    });

    console.log('Database Counts:');
    console.log(`  SourceArticle: ${sourceArticlesCount}`);
    console.log(`  SourceCluster: ${sourceClustersCount}`);
    console.log(`  SourceCluster with articles: ${clustersWithArticles}`);
    console.log(`  Event (OPEN): ${openEventsCount}`);

    // Additional stats
    const [totalEvents, resolvedEvents] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({
        where: {
          resolved: true,
        },
      }),
    ]);

    console.log(`\nAdditional Stats:`);
    console.log(`  Total Events: ${totalEvents}`);
    console.log(`  Resolved Events: ${resolvedEvents}`);

    if (sourceArticlesCount > 0 && sourceClustersCount > 0) {
      console.log('\n[DB Sanity] ✓ Database has data');
      process.exit(0);
    } else {
      console.log('\n[DB Sanity] ⚠ Database is empty - run ingestion first');
      process.exit(1);
    }
  } catch (error) {
    console.error('[DB Sanity] Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
