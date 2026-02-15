/**
 * Funzione principale: verifyCandidates(candidates) – Fase 2.
 * Filtra e ordina i candidati per verificabilità (esito binario, fonte, scadenza, vaghezza).
 * Scarta anche candidati la cui data esito (es. "entro fine 2023") è già nel passato.
 */

import type { NewsCandidate } from "../event-sources/types";
import type { VerifiedCandidate, VerificationConfig } from "./types";
import { getVerificationConfigFromEnv } from "./config";
import {
  evaluateResolvabilityCriteria,
  isDomainAllowed,
  isTitleTooVague,
} from "./criteria";
import { parseOutcomeDateFromText } from "../event-generation/closes-at";

/**
 * Calcola lo score di verificabilità (0–1) dai criteri di risolvibilità.
 * Pesi: domainAllowed e notTooVague obbligatori; binaryOutcome, hasOfficialSource, plausibleDeadline danno bonus.
 */
function computeVerificationScore(
  criteria: ReturnType<typeof evaluateResolvabilityCriteria>
): number {
  if (!criteria.domainAllowed || !criteria.notTooVague) return 0;

  let score = 0.4; // base se supera i filtri minimi
  if (criteria.binaryOutcome) score += 0.25;
  if (criteria.hasOfficialSource) score += 0.2;
  if (criteria.plausibleDeadline) score += 0.15;
  return Math.min(1, score);
}

/**
 * Verifica e filtra i candidati dalla Fase 1.
 *
 * - Applica whitelist/blacklist domini (configurabile da env o file).
 * - Scarta titoli troppo vaghi (lunghezza, parole chiave da evitare).
 * - Assegna un verificationScore (0–1) e, se config.filterByScore, scarta sotto soglia.
 *
 * @param candidates – Array di candidati (stesso formato della Fase 1)
 * @param config – Configurazione (opzionale; default da env)
 * @returns Array di candidati verificati (stesso formato + verificationScore), ordinati per score decrescente
 */
export function verifyCandidates(
  candidates: NewsCandidate[],
  config?: VerificationConfig
): VerifiedCandidate[] {
  const cfg = config ?? getVerificationConfigFromEnv();
  const results: VerifiedCandidate[] = [];

  const now = Date.now();
  for (const c of candidates) {
    if (!c.title || !c.url) continue;

    if (!isDomainAllowed(c.url, cfg)) continue;
    if (isTitleTooVague(c.title, cfg)) continue;

    // Scarta candidati con data esito già passata (es. "entro fine 2023", "elezioni 2022")
    const text = [c.title, c.snippet ?? ""].filter(Boolean).join(" ");
    const outcomeDate = parseOutcomeDateFromText(text);
    if (outcomeDate && outcomeDate.getTime() < now) continue;

    const criteria = evaluateResolvabilityCriteria(
      c.title,
      c.snippet ?? "",
      c.url,
      c.sourceName ?? "",
      cfg
    );
    const verificationScore = computeVerificationScore(criteria);

    if (cfg.filterByScore && verificationScore < cfg.minVerificationScore) continue;

    results.push({
      ...c,
      verificationScore,
    });
  }

  results.sort((a, b) => b.verificationScore - a.verificationScore);
  return results;
}
