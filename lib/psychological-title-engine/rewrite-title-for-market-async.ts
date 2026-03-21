/**
 * Psychological Title Engine - Punto unico per riscrivere titoli per prediction market.
 * Tutti i titoli (domande evento) passano da qui: AI quando abilitata, altrimenti cleanup rule-based.
 *
 * Usa l'AI Title Engine (LLM) per trasformare notizie/titoli grezzi nella migliore versione
 * per un mercato di previsione (chiaro, domanda SÌ/NO o multi-opzione, italiano). Fallback: rewriteFreeformTitleForMarket.
 */

import type { MarketTypeId } from "@/lib/market-types";
import { generateTitleAndMarketType } from "@/lib/ai-title-engine/generate-title-and-market-type";
import { rewriteFreeformTitleForMarket } from "./freeform-rewrite";

export interface RewriteTitleResult {
  title: string;
  marketType?: MarketTypeId;
}

/**
 * Riscrive un titolo (notizia/claim grezzo) nella migliore versione per un prediction market.
 * Se l'AI Title Engine è abilitato e risponde, usa il titolo generato dall'LLM e il marketType.
 * Altrimenti applica solo la normalizzazione rule-based (prefissi, lunghezza, "?").
 *
 * @param title - Titolo grezzo (es. da template, da MDE, da admin)
 * @param category - Categoria opzionale (migliora il contesto per l'AI)
 * @returns Titolo ottimizzato e opzionale marketType (per multi-opzione)
 */
export async function rewriteTitleForPredictionMarket(
  title: string,
  category?: string
): Promise<RewriteTitleResult> {
  const raw = (title ?? "").trim();
  if (!raw) return { title: "Evento?" };

  try {
    const result = await generateTitleAndMarketType(raw, category);
    if (result?.title && result.title.trim().length > 0) {
      return { title: result.title.trim(), marketType: result.market_type };
    }
  } catch {
    // Fallback sotto
  }

  return { title: rewriteFreeformTitleForMarket(raw) };
}

/** Tipo minimo per candidati che hanno title + category (e opzionale rawTitle, marketType). */
export interface CandidateWithTitle {
  title: string;
  category: string;
  rawTitle?: string | null;
  /** Impostato da ensureTitlesForMarket quando l'AI restituisce un tipo (BINARY, RANGE, ecc.). */
  marketType?: string | null;
}

export interface EnsureTitlesForMarketOptions {
  /** Se impostato, solo i primi maxCalls candidati usano l'AI; gli altri solo normalizzazione (per contenere costi). */
  maxCalls?: number;
}

/**
 * Applica il rewrite titolo (AI o rule-based) a tutti i candidati.
 * Modifica candidate.title e candidate.marketType in place. Usare prima di validazione/publish.
 *
 * Tutti gli eventi generati (dashboard admin, storyline, discovery, trend) devono
 * passare da questo blocco per avere domande chiare e precise.
 * Con maxCalls opzionale si limita il numero di chiamate LLM per run (resto: solo normalizzazione).
 */
export async function ensureTitlesForMarket(
  candidates: CandidateWithTitle[],
  options?: EnsureTitlesForMarketOptions
): Promise<void> {
  const maxCalls = options?.maxCalls ?? candidates.length;
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]!;
    const inputTitle = (c.rawTitle ?? c.title)?.trim() || c.title;
    if (!inputTitle) continue;
    if (i < maxCalls) {
      const result = await rewriteTitleForPredictionMarket(inputTitle, c.category);
      c.title = result.title;
      if (result.marketType != null) c.marketType = result.marketType;
    } else {
      c.title = rewriteFreeformTitleForMarket(inputTitle);
    }
  }
}
