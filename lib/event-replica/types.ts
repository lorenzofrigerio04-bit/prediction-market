import type { PrismaClient } from "@prisma/client";
import type { Candidate } from "@/lib/event-gen-v2/types";

export type ReplicaSourcePlatform = "polymarket" | "kalshi";

export interface ReplicaOutcomeOption {
  key: string;
  label: string;
}

export interface ReplicaMarketRulebook {
  sourceRaw: string;
  resolutionSourceUrl: string;
  resolutionAuthorityHost: string;
  resolutionAuthorityType: "OFFICIAL" | "REPUTABLE";
  edgeCases: string[];
  settlementNotes: string;
}

export interface ReplicaProvenance {
  sourcePlatform: ReplicaSourcePlatform;
  externalId: string;
  sourceUrl: string;
  fetchedAt: string;
  confidence: number;
  riskFlags: string[];
  rankMetric?: "volume";
  rankValue?: number;
}

export interface SourceMarket {
  externalId: string;
  sourcePlatform: ReplicaSourcePlatform;
  sourceUrl: string;
  title: string;
  description: string;
  category: string;
  closeTime: Date;
  outcomes: ReplicaOutcomeOption[];
  rulebook: ReplicaMarketRulebook;
  rawPayload: Record<string, unknown>;
  provenance: ReplicaProvenance;
}

export interface ItalyInterestResult {
  keep: boolean;
  score: number;
  confidence: number;
  riskFlags: string[];
  reasons: string[];
}

export interface SemanticTranslationResult {
  titleIt: string;
  descriptionIt: string;
  rulebookIt: string;
  edgeCasesIt: string[];
  confidence: number;
  usedAI: boolean;
  riskFlags: string[];
}

export interface ReplicaCandidate extends Candidate {
  replica: {
    sourcePlatform: ReplicaSourcePlatform;
    externalId: string;
    sourceUrl: string;
    canonicalKey: string;
    italyInterestScore: number;
    italyInterestConfidence: number;
    translationConfidence: number;
    riskFlags: string[];
    importedAt: string;
  };
}

export interface ReplicaRunParams {
  prisma: PrismaClient;
  now?: Date;
  dryRun?: boolean;
  maxTotal?: number;
  sourcePlatforms?: ReplicaSourcePlatform[];
}

export interface ReplicaRunResult {
  sourceFetchedCount: number;
  dedupedSourceCount: number;
  italyFilteredCount: number;
  translatedCount: number;
  candidatesCount: number;
  rulebookValidCount: number;
  rulebookRejectedCount: number;
  dedupedCandidatesCount: number;
  selectedCount: number;
  createdCount: number;
  skippedCount: number;
  reasonsCount: Record<string, number>;
  eventIds: string[];
}
