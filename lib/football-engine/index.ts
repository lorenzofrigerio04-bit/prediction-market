/**
 * Football Intelligence Engine — main pipeline orchestrator.
 *
 * RADAR (data collection) → BRAIN (multi-agent analysis) → FORGE (market structuring)
 *
 * Output: Candidate[] compatible with existing event-gen-v2 publisher.
 */

import { runRadar, type RadarOptions } from "./radar";
import { runBrain, type BrainOptions } from "./brain";
import { runForge, type ForgeOutput } from "./forge";
import type { Candidate } from "@/lib/event-gen-v2/types";

// ---------------------------------------------------------------------------
// Pipeline config
// ---------------------------------------------------------------------------

export interface FootballEnginePipelineOptions {
  /** RADAR options */
  radar?: RadarOptions;
  /** BRAIN options */
  brain?: BrainOptions;
  /** If true, return candidates without publishing */
  dryRun?: boolean;
}

export interface FootballEnginePipelineResult {
  candidates: Candidate[];
  diagnostics: {
    radarMatchCount: number;
    radarFloatingSignalCount: number;
    brainInsightCount: number;
    brainIdeaCount: number;
    brainApprovedCount: number;
    brainRejectedCount: number;
    forgeCandidateCount: number;
    forgeSkippedCount: number;
    totalDurationMs: number;
  };
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

export async function runFootballEngine(
  options?: FootballEnginePipelineOptions
): Promise<FootballEnginePipelineResult> {
  const startTime = Date.now();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  FOOTBALL INTELLIGENCE ENGINE — Pipeline Start");
  console.log("═══════════════════════════════════════════════════════════");

  // ── Layer 1: RADAR ───────────────────────────────────────────
  console.log("\n▶ LAYER 1: RADAR (Data Collection)");
  const radarOutput = await runRadar(options?.radar);
  console.log(
    `  ✓ ${radarOutput.matches.length} matches, ${radarOutput.floatingSignals.length} floating signals\n`
  );

  if (radarOutput.matches.length === 0) {
    console.log("  ⚠ No matches found, pipeline ending early.");
    return emptyResult(startTime);
  }

  // ── Layer 2: BRAIN ───────────────────────────────────────────
  console.log("▶ LAYER 2: BRAIN (Multi-Agent Analysis)");
  const brainOutput = await runBrain(radarOutput, options?.brain);
  console.log(
    `  ✓ ${brainOutput.insights.length} insights → ${brainOutput.totalIdeas} ideas → ${brainOutput.approvedEvents.length} approved\n`
  );

  if (brainOutput.approvedEvents.length === 0) {
    console.log("  ⚠ No events approved, pipeline ending early.");
    return {
      candidates: [],
      diagnostics: {
        radarMatchCount: radarOutput.matches.length,
        radarFloatingSignalCount: radarOutput.floatingSignals.length,
        brainInsightCount: brainOutput.insights.length,
        brainIdeaCount: brainOutput.totalIdeas,
        brainApprovedCount: 0,
        brainRejectedCount: brainOutput.rejectedCount,
        forgeCandidateCount: 0,
        forgeSkippedCount: 0,
        totalDurationMs: Date.now() - startTime,
      },
    };
  }

  // ── Layer 3: FORGE ───────────────────────────────────────────
  console.log("▶ LAYER 3: FORGE (Market Structuring)");
  const forgeOutput = runForge(brainOutput);
  console.log(
    `  ✓ ${forgeOutput.candidates.length} candidates produced, ${forgeOutput.skipped.length} skipped\n`
  );

  const totalDurationMs = Date.now() - startTime;

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  PIPELINE COMPLETE in ${(totalDurationMs / 1000).toFixed(1)}s`);
  console.log(`  ${forgeOutput.candidates.length} market candidates ready`);
  console.log("═══════════════════════════════════════════════════════════");

  return {
    candidates: forgeOutput.candidates,
    diagnostics: {
      radarMatchCount: radarOutput.matches.length,
      radarFloatingSignalCount: radarOutput.floatingSignals.length,
      brainInsightCount: brainOutput.insights.length,
      brainIdeaCount: brainOutput.totalIdeas,
      brainApprovedCount: brainOutput.approvedEvents.length,
      brainRejectedCount: brainOutput.rejectedCount,
      forgeCandidateCount: forgeOutput.candidates.length,
      forgeSkippedCount: forgeOutput.skipped.length,
      totalDurationMs,
    },
  };
}

function emptyResult(startTime: number): FootballEnginePipelineResult {
  return {
    candidates: [],
    diagnostics: {
      radarMatchCount: 0,
      radarFloatingSignalCount: 0,
      brainInsightCount: 0,
      brainIdeaCount: 0,
      brainApprovedCount: 0,
      brainRejectedCount: 0,
      forgeCandidateCount: 0,
      forgeSkippedCount: 0,
      totalDurationMs: Date.now() - startTime,
    },
  };
}
