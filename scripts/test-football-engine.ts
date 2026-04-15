/**
 * Quick test script for the Football Intelligence Engine.
 * Run: npx tsx scripts/test-football-engine.ts
 */

import "dotenv/config";
import { runFootballEngine } from "../lib/football-engine";

async function main() {
  console.log("Starting Football Intelligence Engine test run...\n");

  try {
    const result = await runFootballEngine({
      radar: {
        maxTier: 1,
        fetchOddsEnabled: false,
        fetchH2HEnabled: false,
        fetchInjuriesEnabled: false,
      },
      brain: {
        maxMatches: 3,
        minInterestScore: 10,
        skipResolver: true,
      },
      dryRun: true,
    });

    console.log("\n\n=== RESULTS ===");
    console.log(`Candidates produced: ${result.candidates.length}`);
    console.log(`Diagnostics:`, JSON.stringify(result.diagnostics, null, 2));

    if (result.candidates.length > 0) {
      console.log("\n=== SAMPLE CANDIDATES ===");
      for (const c of result.candidates.slice(0, 10)) {
        console.log(`\n  📌 ${c.title}`);
        console.log(`     Type: ${c.marketType ?? "BINARY"} | Template: ${c.templateId}`);
        console.log(`     Closes: ${c.closesAt}`);
        console.log(`     League: ${c.sportLeague}`);
        console.log(`     Momentum: ${c.momentum} | Novelty: ${c.novelty}`);
        if (c.outcomes) {
          console.log(`     Outcomes: ${(c.outcomes as Array<{label: string}>).map((o) => o.label).join(" | ")}`);
        }
      }
    }
  } catch (error) {
    console.error("Pipeline error:", error);
  }
}

main();
