/**
 * Tipi per il modulo di verifica qualità e risolvibilità (Fase 2).
 * Input: candidati dalla Fase 1 (event-sources). Output: candidati verificati con score.
 */

import type { NewsCandidate } from "../event-sources/types";

/** Candidato verificato: stesso formato di NewsCandidate + score di verificabilità (0–1). */
export type VerifiedCandidate = NewsCandidate & {
  /** Score di verificabilità in [0, 1]: più alto = più adatto a evento binario risolvibile. */
  verificationScore: number;
};

/** Configurazione per il modulo di verifica (domini, euristiche titolo). */
export type VerificationConfig = {
  /** Domini consentiti (hostname). Se non vuoto, solo questi sono accettati. */
  domainWhitelist: string[];
  /** Domini sempre esclusi (hostname). */
  domainBlacklist: string[];
  /** Lunghezza minima caratteri del titolo (sotto = troppo vago). */
  minTitleLength: number;
  /** Lunghezza massima caratteri del titolo (sopra = possibile clickbait/rumor). */
  maxTitleLength: number;
  /** Parole/frasi nel titolo che indicano vaghezza (es. "potrebbe", "forse") → penalizzano o scartano. */
  vagueKeywords: string[];
  /** Parole che suggeriscono esito non binario (es. "quanto", "chi vincerà") → penalizzano. */
  nonBinaryKeywords: string[];
  /** Se true, i candidati sotto una soglia di score vengono scartati. */
  filterByScore: boolean;
  /** Soglia minima di verificationScore per includere il candidato (usata se filterByScore). */
  minVerificationScore: number;
};

/** Criteri di risolvibilità (checklist concettuale, usata per calcolare lo score). */
export type ResolvabilityCriteria = {
  /** L'evento ha esito binario (SÌ/NO)? Euristica da titolo/snippet. */
  binaryOutcome: boolean;
  /** Esiste una fonte ufficiale plausibile per la risoluzione? Euristica da dominio/source. */
  hasOfficialSource: boolean;
  /** È plausibile definire una scadenza? (es. "entro X" o evento con data nota). */
  plausibleDeadline: boolean;
  /** Titolo non troppo vago (lunghezza + assenza di parole chiave vaghe). */
  notTooVague: boolean;
  /** Dominio non in blacklist e (se whitelist non vuota) in whitelist. */
  domainAllowed: boolean;
};
