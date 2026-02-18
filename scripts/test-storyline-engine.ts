/**
 * Test script for Storyline Engine
 * Run with: STORYLINE_DEBUG=true tsx scripts/test-storyline-engine.ts
 */

import { prisma } from '../lib/prisma';
import { getEligibleStorylines } from '../lib/storyline-engine';

async function main() {
  console.log('Testing Storyline Engine...\n');

  try {
    const eligible = await getEligibleStorylines({
      prisma,
      now: new Date(),
      lookbackHours: 168, // 7 days
    });

    console.log(`\n✅ Found ${eligible.length} eligible storylines\n`);

    if (eligible.length > 0) {
      console.log('Sample eligible storylines:');
      eligible.slice(0, 5).forEach((storyline, index) => {
        console.log(`\n${index + 1}. Storyline ID: ${storyline.id}`);
        console.log(`   Signals: ${storyline.signalsCount}`);
        console.log(`   Momentum: ${storyline.momentum}`);
        console.log(`   Novelty: ${storyline.novelty}`);
        console.log(`   Authority: ${storyline.authorityType} (${storyline.authorityHost})`);
        console.log(`   Oldest signal: ${storyline.oldestSignalAt.toISOString()}`);
        console.log(`   Newest signal: ${storyline.newestSignalAt.toISOString()}`);
      });
    } else {
      console.log('No eligible storylines found.');
      console.log('This could mean:');
      console.log('- No clusters in database');
      console.log('- All clusters filtered out by criteria');
      console.log('- No signals in the lookback window');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
