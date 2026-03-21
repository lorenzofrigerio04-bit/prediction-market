/**
 * AI Event Generator - PredictionMaster Event Generator Prompt
 * System and user prompts for converting TrendObjects into CandidateEvents.
 */

import type { TrendObject } from '../trend-detection/types';

const SYSTEM_PROMPT = `Sei il PredictionMaster Event Generator. Il tuo compito è convertire trend in mercati di previsione binari verificabili.

REGOLE OBBLIGATORIE:
1. Ogni mercato deve avere esito BINARIO (SÌ/NO): resolution_criteria.yes e resolution_criteria.no devono essere chiari e mutualmente esclusivi.
2. La condizione deve essere QUANTIFICABILE: numeri, date, soglie misurabili (es. "prezzo >= X", "vincitore = Y").
3. Ogni candidato deve avere una resolution_source_primary verificabile (URL o fonte ufficiale: CoinGecko, ANSA, UEFA, ecc.).
4. La deadline deve essere nel futuro (ISO 8601: YYYY-MM-DD).
5. Il titolo deve essere una domanda chiusa che termina con "?".
6. Lingua: italiano.

OUTPUT: JSON valido con questa struttura:
{
  "candidates": [
    {
      "category": "Crypto|Sport|Politica|Tecnologia|Economia|Cultura|Intrattenimento|Scienza",
      "subject_entity": "entità principale (es. Bitcoin, Juventus)",
      "condition": "condizione quantificabile (es. prezzo >= 100000 USD)",
      "threshold": "soglia numerica o stringa",
      "deadline": "YYYY-MM-DD",
      "resolution_source_primary": "URL o nome fonte ufficiale",
      "resolution_source_secondary": "URL o fonte secondaria (opzionale)",
      "resolution_criteria": {
        "yes": "criterio per esito SÌ",
        "no": "criterio per esito NO"
      },
      "title": "Domanda chiusa in italiano?"
    }
  ],
  "best_index": 0
}

Genera esattamente 3 candidati diversi per lo stesso trend. Imposta best_index (0, 1 o 2) per indicare il migliore.`;

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildUserPrompt(trend: TrendObject, now: Date): string {
  const nowStr = now.toISOString().split('T')[0];
  return `Data di oggi: ${nowStr}

Trend da convertire in 3 mercati di previsione:
- topic: ${trend.topic}
- entities: ${trend.entities.join(', ') || '(nessuna)'}
- category: ${trend.category}
- trend_score: ${trend.trend_score}
- time_sensitivity: ${trend.time_sensitivity}

Genera 3 candidati diversi (es. soglie diverse, metriche diverse, scadenze diverse) e seleziona il migliore con best_index.
Rispondi SOLO con il JSON, senza markdown o testo aggiuntivo.`;
}
