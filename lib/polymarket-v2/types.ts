import type { PrismaClient } from "@prisma/client";
import type { ReplicaCandidate, SourceMarket } from "@/lib/event-replica/types";

export interface PolymarketV2RunParams {
  prisma: PrismaClient;
  now?: Date;
  dryRun?: boolean;
  maxTotal?: number;
}

export interface PolymarketV2Config {
  maxPerSource: number;
  timeoutMs: number;
  retryCount: number;
  maxTotalDefault: number;
  processingHeadroomMultiplier: number;
  localizationConcurrency: number;
  groupingMinSiblings: number;
  groupingMaxOutcomes: number;
  fidelityMinScore: number;
  qualityThreshold: number;
  requireAiTranslation: boolean;
}

export interface SoftScoreResult {
  score: number;
  reasons: string[];
}

export interface ValidityGateResult {
  ok: boolean;
  reasons: string[];
}

export interface FidelityGateResult {
  ok: boolean;
  score: number;
  warnings: string[];
}

export interface PolymarketV2CandidateBundle {
  market: SourceMarket;
  candidate: ReplicaCandidate;
  softScore: SoftScoreResult;
  fidelity: FidelityGateResult;
}

export interface PolymarketV2RunResult {
  sourceFetchedCount: number;
  validityPassedCount: number;
  translatedCount: number;
  fidelityPassedCount: number;
  candidatesCount: number;
  binaryCount: number;
  multiOutcomeCount: number;
  selectedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  duplicatesCount: number;
  warningsCount: number;
  errorCount: number;
  reasonsCount: Record<string, number>;
  warningsSummary: Record<string, number>;
  eventIds: string[];
}
