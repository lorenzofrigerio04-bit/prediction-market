import OpenAI from "openai";
import { isOpenAIDisabled } from "@/lib/check-openai-disabled";
import type { ItalyInterestResult, SourceMarket } from "./types";

const ITALY_KEYWORDS = [
  "italia",
  "italian",
  "roma",
  "milano",
  "serie a",
  "europe",
  "ue",
  "vaticano",
  "mediterraneo",
  "eur",
  "euro",
];

const EUROPE_KEYWORDS = [
  "europa",
  "europe",
  "ue",
  "eu",
  "eurozona",
  "ecb",
  "bruxelles",
  "francia",
  "germania",
  "spagna",
  "portogallo",
  "olanda",
  "austria",
  "svizzera",
];

const LOW_RELEVANCE_KEYWORDS = [
  "nhl",
  "nba",
  "nfl",
  "mlb",
  "ncaa",
  "stanley cup",
  "super bowl",
  "world series",
  "los angeles",
  "new york",
  "texas",
  "ohio",
];

const HIGH_RELEVANCE_CATEGORIES = new Set([
  "Politica",
  "Elezioni",
  "Geopolitica",
  "Economia",
  "Finanza",
  "Criptovalute",
  "Tecnologia",
  "Tempo atmosferico",
  "Sport",
  "Cultura",
]);

function baselineCategoryScore(category: string): number {
  if (HIGH_RELEVANCE_CATEGORIES.has(category.trim())) return 0.68;
  return 0.52;
}

function lexicalItalyScore(market: SourceMarket): number {
  const text = `${market.title} ${market.description}`.toLowerCase();
  const hits = ITALY_KEYWORDS.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
  return Math.min(1, hits / 3);
}

function lexicalEuropeScore(market: SourceMarket): number {
  const text = `${market.title} ${market.description}`.toLowerCase();
  const hits = EUROPE_KEYWORDS.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
  return Math.min(1, hits / 3);
}

function lowRelevancePenalty(market: SourceMarket): number {
  const text = `${market.title} ${market.description}`.toLowerCase();
  const hits = LOW_RELEVANCE_KEYWORDS.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
  return Math.min(0.25, hits * 0.08);
}

function heuristicInterestWhenAiUnavailable(market: SourceMarket): {
  score: number;
  confidence: number;
  reasons: string[];
} {
  const lexical = lexicalItalyScore(market);
  const europe = lexicalEuropeScore(market);
  const penalty = lowRelevancePenalty(market);
  const categoryScore = baselineCategoryScore(market.category);
  const provenanceScore = Math.min(1, Math.max(0, market.provenance.confidence || 0.5));
  const raw = lexical * 0.18 + europe * 0.2 + categoryScore * 0.5 + provenanceScore * 0.12;
  const score = Math.min(1, Math.max(0, raw - penalty));
  return {
    score,
    confidence: Math.max(0.35, 0.55 - penalty * 0.3),
    reasons: ["heuristic_mode_no_openai", `low_relevance_penalty:${penalty.toFixed(2)}`],
  };
}

async function aiItalyScore(
  market: SourceMarket
): Promise<{ score: number; confidence: number; reasons: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || isOpenAIDisabled()) {
    return heuristicInterestWhenAiUnavailable(market);
  }

  const client = new OpenAI({ apiKey });
  const prompt = [
    "Sei un analista media Italia 18-50 per prediction markets.",
    "Valuta interesse reale in Italia per il seguente mercato.",
    "Rispondi solo JSON con: score (0-1), confidence (0-1), reasons (array max 3).",
    `Titolo: ${market.title}`,
    `Descrizione: ${market.description}`,
    `Categoria: ${market.category}`,
    `Piattaforma: ${market.sourcePlatform}`,
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: process.env.REPLICA_ITALY_AI_MODEL?.trim() || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 180,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return { score: 0.45, confidence: 0.3, reasons: ["empty_ai_response"] };
    const parsed = JSON.parse(raw) as {
      score?: number;
      confidence?: number;
      reasons?: string[];
    };
    return {
      score: Math.min(1, Math.max(0, Number(parsed.score ?? 0.45))),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.4))),
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 3) : [],
    };
  } catch {
    return {
      ...heuristicInterestWhenAiUnavailable(market),
      reasons: ["ai_scoring_error_fallback"],
    };
  }
}

export async function evaluateItalyInterest(
  market: SourceMarket,
  thresholds: { minScore: number; minConfidence: number; maxRiskFlags: number }
): Promise<ItalyInterestResult> {
  const lexical = lexicalItalyScore(market);
  const ai = await aiItalyScore(market);
  const usingHeuristicFallback =
    ai.reasons.includes("heuristic_mode_no_openai") ||
    ai.reasons.includes("ai_scoring_error_fallback");
  const score = usingHeuristicFallback
    ? ai.score
    : Math.min(1, lexical * 0.35 + ai.score * 0.65);
  const confidence = usingHeuristicFallback
    ? ai.confidence
    : Math.min(1, lexical * 0.2 + ai.confidence * 0.8);
  const reasons = [
    `lexical_score:${lexical.toFixed(2)}`,
    ...ai.reasons,
  ];

  const riskFlags = [...market.provenance.riskFlags];
  const penalty = lowRelevancePenalty(market);
  if (score < thresholds.minScore) riskFlags.push("low_italy_interest_score");
  if (confidence < thresholds.minConfidence) riskFlags.push("low_italy_interest_confidence");
  if (penalty >= 0.22) riskFlags.push("low_europe_relevance");

  // Balanced mode: allow borderline markets if they are close to threshold and not too risky.
  const borderlineKeep =
    score >= thresholds.minScore - 0.12 &&
    confidence >= thresholds.minConfidence - 0.1 &&
    riskFlags.length <= Math.max(1, thresholds.maxRiskFlags - 1) &&
    !riskFlags.includes("low_europe_relevance");

  const keep =
    (score >= thresholds.minScore && confidence >= thresholds.minConfidence || borderlineKeep) &&
    riskFlags.length <= thresholds.maxRiskFlags;

  return {
    keep,
    score,
    confidence,
    reasons,
    riskFlags,
  };
}
