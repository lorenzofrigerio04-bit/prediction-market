import type { SemanticTranslationResult, SourceMarket } from "@/lib/event-replica/types";
import { translateMarketSemantically } from "@/lib/event-replica/semantic-translator";

export async function localizePolymarketMarket(
  market: SourceMarket
): Promise<SemanticTranslationResult> {
  return translateMarketSemantically(market);
}
