/**
 * Modulo di verifica qualità e risolvibilità (Fase 2).
 *
 * Input: array di candidati da Fase 1 (event-sources).
 * Output: array di candidati verificati (stesso formato + verificationScore 0–1).
 *
 * Criteri: esito binario, fonte ufficiale plausibile, scadenza plausibile,
 * domini whitelist/blacklist, titolo non troppo vago.
 */

export { verifyCandidates } from "./verify";
export { getVerificationConfigFromEnv, DEFAULT_VERIFICATION_CONFIG } from "./config";
export {
  evaluateResolvabilityCriteria,
  isDomainAllowed,
  isTitleTooVague,
  suggestsNonBinary,
  hasOfficialLikeSource,
  suggestsPlausibleDeadline,
  getHostname,
  DEFAULT_VAGUE_KEYWORDS,
  DEFAULT_NON_BINARY_KEYWORDS,
} from "./criteria";

export type {
  VerifiedCandidate,
  VerificationConfig,
  ResolvabilityCriteria,
} from "./types";
