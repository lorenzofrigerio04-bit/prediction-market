import type { ReplicaCandidate, SourceMarket } from "./types";
import { canonicalReplicaKey } from "./utils";

function toMarketType(market: SourceMarket): "BINARY" | "MULTIPLE_CHOICE" {
  const outcomes = market.outcomes ?? [];
  if (outcomes.length === 0) return "BINARY";
  if (outcomes.length > 2) return "MULTIPLE_CHOICE";
  const labels = outcomes.map((o) => o.label.trim().toLowerCase());
  const yesNo = new Set(["yes", "no", "si", "sì"]);
  const allBinary = labels.every((l) => yesNo.has(l));
  if (!allBinary) return "MULTIPLE_CHOICE";
  const title = market.title.toLowerCase();
  if (/\b(how many|quanti|which|chi|range|between|fra|tra)\b/.test(title)) {
    return "MULTIPLE_CHOICE";
  }
  return "BINARY";
}

function yesNoCriteria(titleIt: string, sourceLabel: string): { yes: string; no: string } {
  return {
    yes: `Il mercato si risolve SÌ se la condizione indicata in "${titleIt}" si verifica entro la scadenza, secondo la fonte primaria: ${sourceLabel}.`,
    no: `Il mercato si risolve NO se la condizione indicata in "${titleIt}" non si verifica entro la scadenza, o se la fonte primaria ${sourceLabel} determina il contrario.`,
  };
}

function ensureReplicaQuestionTitle(input: string): string {
  const raw = input.trim();
  const withQuestion = raw.endsWith("?") ? raw : `${raw}?`;
  const words = withQuestion.split(/\s+/).filter(Boolean);
  if (withQuestion.length >= 20 && words.length >= 3) {
    return withQuestion;
  }
  // Enforce rulebook title clarity constraints for imported short titles.
  return `Entro la scadenza, si verificherà questo evento: ${raw}?`;
}

export function buildReplicaCandidate(params: {
  market: SourceMarket;
  translated: {
    titleIt: string;
    descriptionIt: string;
    rulebookIt: string;
    edgeCasesIt: string[];
    confidence: number;
    riskFlags: string[];
  };
  rank: {
    metric: "volume";
    value: number;
  };
}): ReplicaCandidate {
  const { market, translated, rank } = params;
  const canonicalKey = canonicalReplicaKey({
    title: market.title,
    sourcePlatform: market.sourcePlatform,
    closeTimeIso: market.closeTime.toISOString(),
  });
  const marketType = toMarketType(market);
  const sourceLabel = market.rulebook.resolutionAuthorityHost || "fonte ufficiale";
  const binary = yesNoCriteria(translated.titleIt, sourceLabel);
  const titleBase =
    marketType === "BINARY" && !translated.titleIt.endsWith("?")
      ? `${translated.titleIt}?`
      : translated.titleIt;
  const title = ensureReplicaQuestionTitle(titleBase);

  const riskFlags = [
    ...new Set([...market.provenance.riskFlags, ...translated.riskFlags]),
  ];

  const descriptionBlock = [
    translated.descriptionIt,
    "",
    "Regole di mercato:",
    translated.rulebookIt,
    "",
    `Scadenza: ${market.closeTime.toISOString()}`,
    `Fonte primaria di risoluzione: ${sourceLabel}`,
    "",
    "Edge case:",
    ...(translated.edgeCasesIt.length > 0 ? translated.edgeCasesIt.map((e) => `- ${e}`) : ["- Nessuno"]),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    rawTitle: market.title,
    title,
    description: descriptionBlock,
    category: market.category,
    closesAt: market.closeTime,
    resolutionAuthorityHost: market.rulebook.resolutionAuthorityHost,
    resolutionAuthorityType: market.rulebook.resolutionAuthorityType,
    resolutionCriteriaYes: binary.yes,
    resolutionCriteriaNo: binary.no,
    sourceStorylineId: `replica:${market.sourcePlatform}:${market.externalId}`,
    templateId: "replica-import",
    resolutionSourceUrl: market.rulebook.resolutionSourceUrl,
    resolutionCriteriaFull: translated.rulebookIt,
    edgeCasePolicyRef: "REPLICA_BALANCED",
    marketType,
    outcomes:
      marketType === "MULTIPLE_CHOICE"
        ? market.outcomes.map((option, idx) => ({
            key: option.key || `opt_${idx}`,
            label: option.label,
          }))
        : null,
    timezone: "Europe/Rome",
    momentum: Math.max(40, Math.min(100, Math.round(rank.value / 5_000))),
    novelty: Math.max(0, Math.round(100 - Math.min(100, rank.value / 10_000))),
    creationMetadata: {
      created_by_pipeline: "event-replica",
      pipeline_version: "1.0",
      replica_canonical_key: canonicalKey,
      replica_source_platform: market.sourcePlatform,
      replica_external_id: market.externalId,
      replica_category: market.category,
      replica_rank_metric: rank.metric,
      replica_rank_value: rank.value,
      replica_source_url: market.sourceUrl,
      replica_translation_confidence: translated.confidence,
      replica_risk_flags: riskFlags,
      replica_resolution_source_url: market.rulebook.resolutionSourceUrl,
      replica_outcomes_original: market.outcomes,
      replica_rulebook_raw: market.rulebook.sourceRaw,
    },
    replica: {
      sourcePlatform: market.sourcePlatform,
      externalId: market.externalId,
      sourceUrl: market.sourceUrl,
      canonicalKey,
      italyInterestScore: 1,
      italyInterestConfidence: 1,
      translationConfidence: translated.confidence,
      riskFlags,
      importedAt: new Date().toISOString(),
    },
  };
}
