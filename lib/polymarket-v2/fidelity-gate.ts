import type { SourceMarket } from "@/lib/event-replica/types";
import type { SemanticTranslationResult } from "@/lib/event-replica/types";
import type { FidelityGateResult } from "./types";

function hasDigitToken(text: string): boolean {
  return /\d/.test(text);
}

export function runFidelityGate(
  market: SourceMarket,
  translated: SemanticTranslationResult,
  minScore: number
): FidelityGateResult {
  const warnings: string[] = [];
  let score = 1;

  const original = market.title;
  const localized = translated.titleIt;

  if (!localized?.trim()) {
    score -= 0.4;
    warnings.push("empty_localized_title");
  }
  if (hasDigitToken(original) && !hasDigitToken(localized)) {
    score -= 0.2;
    warnings.push("lost_numeric_token");
  }
  if (original.includes("?") && !localized.includes("?")) {
    score -= 0.1;
    warnings.push("lost_question_polarity");
  }
  if ((translated.edgeCasesIt?.length ?? 0) === 0 && (market.rulebook.edgeCases?.length ?? 0) > 0) {
    score -= 0.1;
    warnings.push("lost_edge_cases");
  }
  if (translated.confidence < 0.6) {
    score -= 0.15;
    warnings.push("low_translation_confidence");
  }

  score = Math.max(0, Math.min(1, score));
  return {
    ok: score >= minScore,
    score,
    warnings,
  };
}
